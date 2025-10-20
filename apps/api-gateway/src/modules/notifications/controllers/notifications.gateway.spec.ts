import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { Server, Socket } from 'socket.io';

const mockNotificationsClient = {
  send: jest.fn(),
};

const createMockSocket = (id: string): Partial<Socket> => ({
  id,
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
});

const createMockServer = (): Partial<Server> => ({
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
});

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: 'NOTIFICATIONS_SERVICE', useValue: mockNotificationsClient },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    mockServer = createMockServer();
    gateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAuthenticate', () => {
    it('should register user socket and join room', () => {
      const userId = 'user-123';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const data = { userId };

      const result = gateway.handleAuthenticate(data, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(`user:${userId}`);
      expect(result).toEqual({ success: true });
    });

    it('should create new Set for new user', () => {
      const userId = 'user-123';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const data = { userId };

      gateway.handleAuthenticate(data, mockSocket);

      const userSockets = gateway['userSockets'];
      expect(userSockets.has(userId)).toBe(true);
      expect(userSockets.get(userId)?.has('socket-abc')).toBe(true);
    });

    it('should add socket to existing user Set', () => {
      const userId = 'user-123';
      const mockSocket1 = createMockSocket('socket-1') as Socket;
      const mockSocket2 = createMockSocket('socket-2') as Socket;

      gateway.handleAuthenticate({ userId }, mockSocket1);
      gateway.handleAuthenticate({ userId }, mockSocket2);

      const userSockets = gateway['userSockets'];
      expect(userSockets.get(userId)?.size).toBe(2);
      expect(userSockets.get(userId)?.has('socket-1')).toBe(true);
      expect(userSockets.get(userId)?.has('socket-2')).toBe(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from userSockets', () => {
      const userId = 'user-123';
      const mockSocket = createMockSocket('socket-abc') as Socket;

      gateway.handleAuthenticate({ userId }, mockSocket);
      gateway.handleDisconnect(mockSocket);

      const userSockets = gateway['userSockets'];
      expect(userSockets.has(userId)).toBe(false);
    });

    it('should keep other user sockets when one disconnects', () => {
      const userId = 'user-123';
      const mockSocket1 = createMockSocket('socket-1') as Socket;
      const mockSocket2 = createMockSocket('socket-2') as Socket;

      gateway.handleAuthenticate({ userId }, mockSocket1);
      gateway.handleAuthenticate({ userId }, mockSocket2);
      gateway.handleDisconnect(mockSocket1);

      const userSockets = gateway['userSockets'];
      expect(userSockets.get(userId)?.has('socket-1')).toBe(false);
      expect(userSockets.get(userId)?.has('socket-2')).toBe(true);
      expect(userSockets.get(userId)?.size).toBe(1);
    });

    it('should remove user entry when last socket disconnects', () => {
      const userId = 'user-123';
      const mockSocket = createMockSocket('socket-abc') as Socket;

      gateway.handleAuthenticate({ userId }, mockSocket);
      
      const userSocketsBefore = gateway['userSockets'];
      expect(userSocketsBefore.has(userId)).toBe(true);

      gateway.handleDisconnect(mockSocket);

      const userSocketsAfter = gateway['userSockets'];
      expect(userSocketsAfter.has(userId)).toBe(false);
    });

    it('should handle disconnect of non-authenticated socket', () => {
      const mockSocket = createMockSocket('socket-xyz') as Socket;

      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });
  });

  describe('sendNotificationToUser', () => {
    it('should emit notification to correct user room', async () => {
      const userId = 'user-123';
      const notification = {
        id: 'notif-123',
        title: 'Test Notification',
        message: 'Test Message',
      };

      await gateway.sendNotificationToUser(userId, notification);

      expect(mockServer.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockServer.emit).toHaveBeenCalledWith('notification', notification);
    });

    it('should emit notification even if user is not connected', async () => {
      const userId = 'offline-user';
      const notification = { id: 'notif-456', title: 'Test' };

      await gateway.sendNotificationToUser(userId, notification);

      expect(mockServer.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockServer.emit).toHaveBeenCalledWith('notification', notification);
    });
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      const mockSocket = createMockSocket('socket-123') as Socket;

      expect(() => gateway.handleConnection(mockSocket)).not.toThrow();
    });
  });
});

