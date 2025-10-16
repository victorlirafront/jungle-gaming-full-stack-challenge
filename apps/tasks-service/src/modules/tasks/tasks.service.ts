import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Task, Comment, TaskAssignment, TaskHistory } from '../../entities';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTasksDto,
  CreateCommentDto,
  GetCommentsDto,
} from './dto';

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

    // Create assignments if provided
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

    // Create history
    await this.historyRepository.save({
      taskId: savedTask.id,
      userId,
      action: 'CREATED',
      details: `Task "${savedTask.title}" created`,
    });

    // Emit notification event
    this.notificationsClient.emit('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      creatorId: userId,
      assignedUserIds: createTaskDto.assignedUserIds,
    });

    return this.findOne(savedTask.id);
  }

  async findAll(filterDto: FilterTasksDto): Promise<Task[]> {
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

    return query.getMany();
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

    const previousStatus = task.status;
    Object.assign(task, updateTaskDto);

    await this.taskRepository.save(task);

    const changes = Object.keys(updateTaskDto).join(', ');
    await this.historyRepository.save({
      taskId: id,
      userId,
      action: 'UPDATED',
      details: `Updated: ${changes}`,
    });

    // Emit notification if status changed
    if (updateTaskDto.status && updateTaskDto.status !== previousStatus) {
      this.notificationsClient.emit('task.status_changed', {
        taskId: id,
        title: task.title,
        oldStatus: previousStatus,
        newStatus: updateTaskDto.status,
        userId,
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
  ): Promise<Comment[]> {
    await this.findOne(taskId); // Verify task exists

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.taskId = :taskId', { taskId })
      .orderBy('comment.createdAt', 'DESC');

    if (getCommentsDto.limit) {
      query.take(getCommentsDto.limit);
    }

    if (getCommentsDto.offset) {
      query.skip(getCommentsDto.offset);
    }

    return query.getMany();
  }

  async getHistory(taskId: string): Promise<TaskHistory[]> {
    await this.findOne(taskId); // Verify task exists

    return this.historyRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }
}

