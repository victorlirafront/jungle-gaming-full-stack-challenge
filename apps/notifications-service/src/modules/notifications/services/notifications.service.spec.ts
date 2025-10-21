import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../../../entities/notification.entity';

const mockNotificationRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const createMockNotification = (overrides = {}) => ({
  id: 'notification-123',
  userId: 'user-123',
  type: NotificationType.TASK_CREATED,
  title: 'Test Notification',
  message: 'Test Message',
  data: {},
  read: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: typeof mockNotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepository },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = mockNotificationRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const createDto = {
        userId: 'user-123',
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task',
        message: 'You have been assigned to a task',
        data: { taskId: 'task-456' },
      };
      const mockNotification = createMockNotification(createDto);

      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(createDto);

      expect(notificationRepository.create).toHaveBeenCalledWith(createDto);
      expect(notificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAllByUser', () => {
    const userId = 'user-123';

    it('should return user notifications ordered by date with default limit and offset', async () => {
      const mockNotifications = [
        createMockNotification({ id: 'notif-1', userId }),
        createMockNotification({ id: 'notif-2', userId }),
      ];

      notificationRepository.findAndCount.mockResolvedValue([mockNotifications, 2]);

      const result = await service.findAllByUser(userId);

      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 0,
      });
      expect(result).toEqual({
        data: mockNotifications,
        total: 2,
        limit: 50,
        offset: 0,
      });
    });

    it('should apply custom limit and offset when provided', async () => {
      const mockNotifications = [createMockNotification({ userId })];
      const customLimit = 10;
      const customOffset = 20;

      notificationRepository.findAndCount.mockResolvedValue([mockNotifications, 25]);

      const result = await service.findAllByUser(userId, customLimit, customOffset);

      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: customLimit,
        skip: customOffset,
      });
      expect(result).toEqual({
        data: mockNotifications,
        total: 25,
        limit: customLimit,
        offset: customOffset,
      });
    });

    it('should enforce max limit when provided limit exceeds it', async () => {
      const mockNotifications = [createMockNotification({ userId })];

      notificationRepository.findAndCount.mockResolvedValue([mockNotifications, 1]);

      const result = await service.findAllByUser(userId, 200);

      expect(notificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
      expect(result.limit).toBe(100);
    });

    it('should return empty data array when user has no notifications', async () => {
      notificationRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAllByUser(userId);

      expect(result).toEqual({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
      });
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notif-123';
    const userId = 'user-123';

    it('should mark notification as read successfully', async () => {
      const mockNotification = createMockNotification({ id: notificationId, userId, read: false });
      const updatedNotification = { ...mockNotification, read: true };

      notificationRepository.findOne.mockResolvedValue(mockNotification);
      notificationRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId, userId);

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
      });
      expect(notificationRepository.save).toHaveBeenCalledWith({
        ...mockNotification,
        read: true,
      });
      expect(result.read).toBe(true);
    });

    it('should throw error when notification is not found', async () => {
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, userId)).rejects.toThrow(
        'Notification not found'
      );

      expect(notificationRepository.save).not.toHaveBeenCalled();
    });

    it('should validate that notification belongs to user', async () => {
      const differentUserId = 'different-user-456';

      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, differentUserId)).rejects.toThrow(
        'Notification not found'
      );

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, userId: differentUserId },
      });
    });
  });

  describe('getUnreadCount', () => {
    const userId = 'user-123';

    it('should return count of unread notifications', async () => {
      const unreadCount = 5;

      notificationRepository.count.mockResolvedValue(unreadCount);

      const result = await service.getUnreadCount(userId);

      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: { userId, read: false },
      });
      expect(result).toBe(unreadCount);
    });

    it('should return 0 when user has no unread notifications', async () => {
      notificationRepository.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(0);
    });
  });
});

