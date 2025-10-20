import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, Comment, TaskAssignment, TaskHistory } from '../../entities';
import { TaskPriority, TaskStatus } from '@repo/types';

const mockNotificationsClient = {
  emit: jest.fn(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  loadRelationCountAndMap: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockRepositories = {
  task: {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  },
  comment: {
    save: jest.fn(),
    findAndCount: jest.fn(),
  },
  assignment: {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
  history: {
    save: jest.fn(),
    findAndCount: jest.fn(),
  },
};

const createMockTask = (overrides = {}) => ({
  id: 'task-123',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO',
  priority: TaskPriority.MEDIUM,
  creatorId: 'user-123',
  dueDate: '2025-10-25',
  assignments: [],
  comments: [],
  ...overrides,
});

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: typeof mockRepositories.task;
  let historyRepository: typeof mockRepositories.history;
  let notificationsClient: typeof mockNotificationsClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepositories.task },
        { provide: getRepositoryToken(Comment), useValue: mockRepositories.comment },
        { provide: getRepositoryToken(TaskAssignment), useValue: mockRepositories.assignment },
        { provide: getRepositoryToken(TaskHistory), useValue: mockRepositories.history },
        { provide: 'NOTIFICATIONS_SERVICE', useValue: mockNotificationsClient },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = mockRepositories.task;
    historyRepository = mockRepositories.history;
    notificationsClient = mockNotificationsClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-10-25',
      };
      const userId = 'user-123';
      const mockTask = createMockTask();

      taskRepository.create.mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);
      taskRepository.findOne.mockResolvedValue(mockTask);
      historyRepository.save.mockResolvedValue({});

      const result = await service.create(createTaskDto, userId);

      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        creatorId: userId,
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(historyRepository.save).toHaveBeenCalled();
      expect(notificationsClient.emit).toHaveBeenCalledWith('task.created', {
        taskId: mockTask.id,
        title: mockTask.title,
        creatorId: userId,
        assignedUserIds: undefined,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findOne', () => {
    const taskId = 'task-123';

    it('should return a task when found', async () => {
      const mockTask = createMockTask({ id: taskId });

      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignments', 'comments'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(taskId)).rejects.toThrow(
        `Task with ID ${taskId} not found`
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks without filters', async () => {
      const mockTasks = [
        createMockTask({ id: 'task-1' }),
        createMockTask({ id: 'task-2' }),
      ];
      const filterDto = {};

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 2]);

      const result = await service.findAll(filterDto);

      expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('task.assignments', 'assignments');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
      expect(result).toEqual({
        data: mockTasks,
        total: 2,
        limit: 50,
        offset: 0,
      });
    });

    it('should return filtered tasks by status', async () => {
      const mockTasks = [createMockTask({ status: TaskStatus.TODO })];
      const filterDto = { status: TaskStatus.TODO };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 1]);

      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: TaskStatus.TODO });
      expect(result.data).toEqual(mockTasks);
      expect(result.total).toBe(1);
    });

    it('should apply pagination with custom limit and offset', async () => {
      const mockTasks = [createMockTask()];
      const filterDto = { limit: 10, offset: 20 };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 100]);

      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
    });
  });

  describe('update', () => {
    const taskId = 'task-123';
    const userId = 'user-123';

    it('should update a task successfully when user is the creator', async () => {
      const mockTask = createMockTask({ id: taskId, creatorId: userId });
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      taskRepository.findOne.mockResolvedValueOnce(mockTask);
      taskRepository.save.mockResolvedValue(updatedTask);
      taskRepository.findOne.mockResolvedValueOnce(updatedTask);
      historyRepository.save.mockResolvedValue({});

      const result = await service.update(taskId, updateTaskDto, userId);

      expect(taskRepository.save).toHaveBeenCalled();
      expect(historyRepository.save).toHaveBeenCalledWith({
        taskId,
        userId,
        action: 'UPDATED',
        details: expect.stringContaining('Updated:'),
      });
      expect(notificationsClient.emit).toHaveBeenCalledWith('task.updated', expect.any(Object));
      expect(result).toEqual(updatedTask);
    });

    it('should throw ForbiddenException when user is not the creator', async () => {
      const differentUserId = 'different-user-456';
      const mockTask = createMockTask({ id: taskId, creatorId: userId });
      const updateTaskDto = { title: 'Updated Task' };

      taskRepository.findOne.mockResolvedValue(mockTask);

      await expect(
        service.update(taskId, updateTaskDto, differentUserId)
      ).rejects.toThrow('Only the task creator can edit this task');

      expect(taskRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const taskId = 'task-123';
    const userId = 'user-123';

    it('should remove a task successfully', async () => {
      const mockTask = createMockTask({ id: taskId, title: 'Task to Delete' });

      taskRepository.findOne.mockResolvedValue(mockTask);
      taskRepository.remove.mockResolvedValue(mockTask);
      historyRepository.save.mockResolvedValue({});

      await service.remove(taskId, userId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['assignments', 'comments'],
      });
      expect(historyRepository.save).toHaveBeenCalledWith({
        taskId,
        userId,
        action: 'DELETED',
        details: `Task "${mockTask.title}" deleted`,
      });
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(notificationsClient.emit).toHaveBeenCalledWith('task.deleted', {
        taskId,
        title: mockTask.title,
        userId,
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(NotFoundException);

      expect(taskRepository.remove).not.toHaveBeenCalled();
      expect(historyRepository.save).not.toHaveBeenCalled();
    });
  });
});

