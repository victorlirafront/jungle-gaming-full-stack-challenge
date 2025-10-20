import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { NotificationType } from '../../../entities/notification.entity';
import { TaskCreatedEvent } from '../interfaces/task-events.interface';

const mockNotificationsService = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
  delete: jest.fn(),
};

const mockGatewayClient = {
  emit: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: 'GATEWAY_SERVICE', useValue: mockGatewayClient },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssignedUsersToNotify', () => {
    it('should return users to notify excluding specified users', () => {
      const assignedUserIds = ['user-1', 'user-2', 'user-3'];
      const excludeUserIds = ['user-2'];

      const result = controller['getAssignedUsersToNotify'](assignedUserIds, excludeUserIds);

      expect(result).toEqual(['user-1', 'user-3']);
      expect(result).not.toContain('user-2');
    });

    it('should return empty array when assignedUserIds is undefined', () => {
      const result = controller['getAssignedUsersToNotify'](undefined, ['user-1']);

      expect(result).toEqual([]);
    });

    it('should return empty array when assignedUserIds is empty', () => {
      const result = controller['getAssignedUsersToNotify']([], ['user-1']);

      expect(result).toEqual([]);
    });

    it('should exclude multiple users correctly', () => {
      const assignedUserIds = ['user-1', 'user-2', 'user-3', 'user-4'];
      const excludeUserIds = ['user-1', 'user-3'];

      const result = controller['getAssignedUsersToNotify'](assignedUserIds, excludeUserIds);

      expect(result).toEqual(['user-2', 'user-4']);
    });

    it('should remove duplicate users from result', () => {
      const assignedUserIds = ['user-1', 'user-1', 'user-2'];
      const excludeUserIds: string[] = [];

      const result = controller['getAssignedUsersToNotify'](assignedUserIds, excludeUserIds);

      expect(result).toEqual(['user-1', 'user-2']);
      expect(result.length).toBe(2);
    });

    it('should return all users when excludeUserIds is empty', () => {
      const assignedUserIds = ['user-1', 'user-2', 'user-3'];
      const excludeUserIds: string[] = [];

      const result = controller['getAssignedUsersToNotify'](assignedUserIds, excludeUserIds);

      expect(result).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('should return empty array when all users are excluded', () => {
      const assignedUserIds = ['user-1', 'user-2'];
      const excludeUserIds = ['user-1', 'user-2'];

      const result = controller['getAssignedUsersToNotify'](assignedUserIds, excludeUserIds);

      expect(result).toEqual([]);
    });
  });

  describe('handleTaskCreated', () => {
    it('should notify assigned users excluding creator', async () => {
      const event: TaskCreatedEvent = {
        taskId: 'task-123',
        title: 'New Task',
        creatorId: 'creator-1',
        assignedUserIds: ['user-1', 'user-2', 'creator-1'],
      };

      const mockNotification = {
        id: 'notif-123',
        userId: 'user-1',
        type: NotificationType.TASK_ASSIGNED,
        title: 'Nova tarefa atribuída',
        message: `Você foi atribuído à tarefa: ${event.title}`,
        data: { taskId: event.taskId, creatorId: event.creatorId },
        read: false,
      };

      mockNotificationsService.create.mockResolvedValue(mockNotification);

      const result = await controller.handleTaskCreated(event);

      expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: NotificationType.TASK_ASSIGNED,
        title: 'Nova tarefa atribuída',
        message: `Você foi atribuído à tarefa: ${event.title}`,
        data: { taskId: event.taskId, creatorId: event.creatorId },
      });
      expect(mockGatewayClient.emit).toHaveBeenCalledTimes(2);
      expect(mockGatewayClient.emit).toHaveBeenCalledWith('notifications.broadcast', {
        userId: 'user-1',
        notification: mockNotification,
      });
      expect(result).toEqual({ success: true });
    });

    it('should not notify creator', async () => {
      const event: TaskCreatedEvent = {
        taskId: 'task-123',
        title: 'New Task',
        creatorId: 'creator-1',
        assignedUserIds: ['creator-1'],
      };

      const result = await controller.handleTaskCreated(event);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
      expect(mockGatewayClient.emit).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return success when no users to notify', async () => {
      const event: TaskCreatedEvent = {
        taskId: 'task-123',
        title: 'New Task',
        creatorId: 'creator-1',
        assignedUserIds: [],
      };

      const result = await controller.handleTaskCreated(event);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return success when assignedUserIds is undefined', async () => {
      const event: TaskCreatedEvent = {
        taskId: 'task-123',
        title: 'New Task',
        creatorId: 'creator-1',
        assignedUserIds: undefined,
      };

      const result = await controller.handleTaskCreated(event);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});

