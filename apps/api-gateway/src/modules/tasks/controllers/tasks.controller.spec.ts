import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { of } from 'rxjs';
import { JwtPayload, JwtAuthGuard } from '../../../common';

const mockTasksClient = {
  send: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

const createMockUser = (): JwtPayload => ({
  sub: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
});

const createMockTask = (overrides = {}) => ({
  id: 'task-123',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO',
  priority: 'MEDIUM',
  creatorId: 'user-123',
  ...overrides,
});

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: 'TASKS_SERVICE', useValue: mockTasksClient },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should send create message with userId from guard', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'Task Description',
        priority: 'HIGH',
      };
      const user = createMockUser();
      const mockTask = createMockTask();

      mockTasksClient.send.mockReturnValue(of(mockTask));

      const result = await controller.create(createTaskDto, user);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.create', {
        data: createTaskDto,
        userId: user.sub,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should send findAll message with filters', async () => {
      const filterDto = { status: 'TODO', limit: 10 };
      const mockResponse = { data: [], total: 0 };

      mockTasksClient.send.mockReturnValue(of(mockResponse));

      const result = await controller.findAll(filterDto);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.findAll', filterDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should send findOne message with task id', async () => {
      const taskId = 'task-123';
      const mockTask = createMockTask({ id: taskId });

      mockTasksClient.send.mockReturnValue(of(mockTask));

      const result = await controller.findOne(taskId);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.findOne', taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should send update message with userId from guard', async () => {
      const taskId = 'task-123';
      const updateTaskDto = { title: 'Updated Task' };
      const user = createMockUser();
      const mockTask = createMockTask({ id: taskId, ...updateTaskDto });

      mockTasksClient.send.mockReturnValue(of(mockTask));

      const result = await controller.update(taskId, updateTaskDto, user);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.update', {
        id: taskId,
        data: updateTaskDto,
        userId: user.sub,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should send remove message with userId from guard', async () => {
      const taskId = 'task-123';
      const user = createMockUser();

      mockTasksClient.send.mockReturnValue(of({ success: true }));

      const result = await controller.remove(taskId, user);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.remove', {
        id: taskId,
        userId: user.sub,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('createComment', () => {
    it('should send createComment message with userId from guard', async () => {
      const taskId = 'task-123';
      const createCommentDto = { content: 'New comment' };
      const user = createMockUser();
      const mockComment = { id: 'comment-123', ...createCommentDto };

      mockTasksClient.send.mockReturnValue(of(mockComment));

      const result = await controller.createComment(taskId, createCommentDto, user);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.createComment', {
        taskId,
        data: createCommentDto,
        userId: user.sub,
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('getComments', () => {
    it('should send getComments message with pagination', async () => {
      const taskId = 'task-123';
      const getCommentsDto = { limit: 10, offset: 0 };
      const mockResponse = { data: [], total: 0 };

      mockTasksClient.send.mockReturnValue(of(mockResponse));

      const result = await controller.getComments(taskId, getCommentsDto);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.getComments', {
        taskId,
        query: getCommentsDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHistory', () => {
    it('should send getHistory message with pagination', async () => {
      const taskId = 'task-123';
      const getHistoryDto = { limit: 10, offset: 0 };
      const mockResponse = { data: [], total: 0 };

      mockTasksClient.send.mockReturnValue(of(mockResponse));

      const result = await controller.getHistory(taskId, getHistoryDto);

      expect(mockTasksClient.send).toHaveBeenCalledWith('tasks.getHistory', {
        taskId,
        query: getHistoryDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

