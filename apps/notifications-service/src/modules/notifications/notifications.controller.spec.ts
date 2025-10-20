import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

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
      const excludeUserIds = [];

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
});

