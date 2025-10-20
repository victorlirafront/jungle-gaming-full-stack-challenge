import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../../entities/notification.entity';

const mockNotificationRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
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
});

