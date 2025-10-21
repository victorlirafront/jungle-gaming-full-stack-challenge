import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Task, Comment, TaskAssignment, TaskHistory } from '../../../entities';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTasksDto,
  CreateCommentDto,
  GetCommentsDto,
  GetHistoryDto,
} from '../dto';
import { PAGINATION_CONSTANTS } from '../../../common/constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(TaskAssignment)
    private assignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(TaskHistory)
    private historyRepository: Repository<TaskHistory>,
    @Inject('NOTIFICATIONS_SERVICE')
    private notificationsClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      creatorId: userId,
    });

    const savedTask = await this.taskRepository.save(task);

    if (createTaskDto.assignedUserIds?.length) {
      const assignments = createTaskDto.assignedUserIds.map((assignedUserId) =>
        this.assignmentRepository.create({
          taskId: savedTask.id,
          userId: assignedUserId,
          assignedBy: userId,
        })
      );
      await this.assignmentRepository.save(assignments);
    }

    await this.historyRepository.save({
      taskId: savedTask.id,
      userId,
      action: 'CREATED',
      details: `Task "${savedTask.title}" created`,
    });

    this.notificationsClient.emit('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      creatorId: userId,
      assignedUserIds: createTaskDto.assignedUserIds,
    });

    return this.findOne(savedTask.id);
  }

  async findAll(filterDto: FilterTasksDto): Promise<{
    data: Task[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .loadRelationCountAndMap('task.commentsCount', 'task.comments');

    if (filterDto.status) {
      query.andWhere('task.status = :status', { status: filterDto.status });
    }

    if (filterDto.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filterDto.priority,
      });
    }

    if (filterDto.creatorId) {
      query.andWhere('task.creatorId = :creatorId', {
        creatorId: filterDto.creatorId,
      });
    }

    if (filterDto.assignedUserId) {
      query.andWhere('assignments.userId = :userId', {
        userId: filterDto.assignedUserId,
      });
    }

    const limit = filterDto.limit || PAGINATION_CONSTANTS.TASKS_DEFAULT_LIMIT;
    const offset = filterDto.offset || PAGINATION_CONSTANTS.DEFAULT_OFFSET;

    query.take(limit).skip(offset);
    query.orderBy('task.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignments', 'comments'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<Task> {
    const task = await this.findOne(id);

    if (task.creatorId !== userId) {
      throw new ForbiddenException('Only the task creator can edit this task');
    }

    const previousStatus = task.status;
    const { assignedUserIds: newAssignedUserIds, ...taskUpdates } = updateTaskDto;

    Object.assign(task, taskUpdates);
    await this.taskRepository.save(task);

    const previousAssignedUserIds = task.assignments?.map((a) => a.userId) || [];
    let currentAssignedUserIds = previousAssignedUserIds;

    let newlyAssignedUsers: string[] = [];

    if (newAssignedUserIds !== undefined) {
      await this.assignmentRepository.delete({ taskId: id });

      if (newAssignedUserIds.length > 0) {
        const assignments = newAssignedUserIds.map((assignedUserId) =>
          this.assignmentRepository.create({
            taskId: id,
            userId: assignedUserId,
            assignedBy: userId,
          })
        );
        await this.assignmentRepository.save(assignments);
      }

      newlyAssignedUsers = newAssignedUserIds.filter(
        (uid) => !previousAssignedUserIds.includes(uid)
      );

      if (newlyAssignedUsers.length > 0) {
        this.notificationsClient.emit('task.assigned', {
          taskId: id,
          title: task.title,
          creatorId: task.creatorId,
          assignedUserIds: newlyAssignedUsers,
        });
      }

      currentAssignedUserIds = newAssignedUserIds;
    }

    const changesList = Object.keys(updateTaskDto);
    await this.historyRepository.save({
      taskId: id,
      userId,
      action: 'UPDATED',
      details: `Updated: ${changesList.join(', ')}`,
    });

    this.notificationsClient.emit('task.updated', {
      taskId: id,
      title: task.title,
      changes: changesList,
      userId,
      assignedUserIds: currentAssignedUserIds,
      creatorId: task.creatorId,
      newlyAssignedUserIds: newlyAssignedUsers,
    });

    if (updateTaskDto.status && updateTaskDto.status !== previousStatus) {
      this.notificationsClient.emit('task.status_changed', {
        taskId: id,
        title: task.title,
        oldStatus: previousStatus,
        newStatus: updateTaskDto.status,
        userId,
        assignedUserIds: currentAssignedUserIds,
        creatorId: task.creatorId,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id);

    await this.historyRepository.save({
      taskId: id,
      userId,
      action: 'DELETED',
      details: `Task "${task.title}" deleted`,
    });

    await this.taskRepository.remove(task);

    this.notificationsClient.emit('task.deleted', {
      taskId: id,
      title: task.title,
      userId,
    });
  }

  async createComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    userId: string
  ): Promise<Comment> {
    const task = await this.findOne(taskId);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      authorId: userId,
    });

    const savedComment = await this.commentRepository.save(comment);

    await this.historyRepository.save({
      taskId,
      userId,
      action: 'COMMENTED',
      details: 'Added a comment',
    });

    const assignedUserIds = task.assignments?.map((a) => a.userId) || [];

    this.notificationsClient.emit('task.commented', {
      taskId,
      commentId: savedComment.id,
      authorId: userId,
      creatorId: task.creatorId,
      assignedUserIds,
    });

    return savedComment;
  }

  async getComments(
    taskId: string,
    getCommentsDto: GetCommentsDto
  ): Promise<{ data: Comment[]; total: number }> {
    await this.findOne(taskId);

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.taskId = :taskId', { taskId })
      .orderBy('comment.createdAt', 'DESC');

    const limit = getCommentsDto.limit || PAGINATION_CONSTANTS.DEFAULT_LIMIT;
    const offset = getCommentsDto.offset || PAGINATION_CONSTANTS.DEFAULT_OFFSET;

    query.take(limit).skip(offset);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async getHistory(
    taskId: string,
    getHistoryDto: GetHistoryDto
  ): Promise<{ data: TaskHistory[]; total: number }> {
    await this.findOne(taskId);

    const query = this.historyRepository
      .createQueryBuilder('history')
      .where('history.taskId = :taskId', { taskId })
      .orderBy('history.createdAt', 'DESC');

    const limit = getHistoryDto.limit || PAGINATION_CONSTANTS.DEFAULT_LIMIT;
    const offset = getHistoryDto.offset || PAGINATION_CONSTANTS.DEFAULT_OFFSET;

    query.take(limit).skip(offset);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}

