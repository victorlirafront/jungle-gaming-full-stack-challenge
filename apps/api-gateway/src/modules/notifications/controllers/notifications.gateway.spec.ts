import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../../../common';

const mockNotificationsClient = {
  send: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
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
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: 'NOTIFICATIONS_SERVICE', useValue: mockNotificationsClient },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtService = mockJwtService;
    mockServer = createMockServer();
    gateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAuthenticate', () => {
    it('should authenticate with valid JWT token', async () => {
      const userId = 'user-123';
      const token = 'valid-jwt-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await gateway.handleAuthenticate({ token }, mockSocket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${userId}`);
      expect(result).toEqual({ success: true, userId });
    });

    it('should throw UnauthorizedException with invalid token', async () => {
      const token = 'invalid-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(gateway.handleAuthenticate({ token }, mockSocket)).rejects.toThrow(UnauthorizedException);
      await expect(gateway.handleAuthenticate({ token }, mockSocket)).rejects.toThrow('Invalid token');

      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should create new Set for new user', async () => {
      const userId = 'user-123';
      const token = 'valid-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleAuthenticate({ token }, mockSocket);

      const userSockets = gateway['userSockets'];
      expect(userSockets.has(userId)).toBe(true);
      expect(userSockets.get(userId)?.has('socket-abc')).toBe(true);
    });

    it('should add socket to existing user Set', async () => {
      const userId = 'user-123';
      const token1 = 'token-1';
      const token2 = 'token-2';
      const mockSocket1 = createMockSocket('socket-1') as Socket;
      const mockSocket2 = createMockSocket('socket-2') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleAuthenticate({ token: token1 }, mockSocket1);
      await gateway.handleAuthenticate({ token: token2 }, mockSocket2);

      const userSockets = gateway['userSockets'];
      expect(userSockets.get(userId)?.size).toBe(2);
      expect(userSockets.get(userId)?.has('socket-1')).toBe(true);
      expect(userSockets.get(userId)?.has('socket-2')).toBe(true);
    });

    it('should extract userId from token payload not from client', async () => {
      const realUserId = 'real-user-123';
      const fakeUserId = 'fake-user-456';
      const token = 'valid-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const mockPayload: JwtPayload = { sub: realUserId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await gateway.handleAuthenticate({ token }, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(`user:${realUserId}`);
      expect(result.userId).toBe(realUserId);
      expect(result.userId).not.toBe(fakeUserId);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from userSockets', async () => {
      const userId = 'user-123';
      const token = 'valid-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleAuthenticate({ token }, mockSocket);
      gateway.handleDisconnect(mockSocket);

      const userSockets = gateway['userSockets'];
      expect(userSockets.has(userId)).toBe(false);
    });

    it('should keep other user sockets when one disconnects', async () => {
      const userId = 'user-123';
      const token1 = 'token-1';
      const token2 = 'token-2';
      const mockSocket1 = createMockSocket('socket-1') as Socket;
      const mockSocket2 = createMockSocket('socket-2') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleAuthenticate({ token: token1 }, mockSocket1);
      await gateway.handleAuthenticate({ token: token2 }, mockSocket2);
      gateway.handleDisconnect(mockSocket1);

      const userSockets = gateway['userSockets'];
      expect(userSockets.get(userId)?.has('socket-1')).toBe(false);
      expect(userSockets.get(userId)?.has('socket-2')).toBe(true);
      expect(userSockets.get(userId)?.size).toBe(1);
    });

    it('should remove user entry when last socket disconnects', async () => {
      const userId = 'user-123';
      const token = 'valid-token';
      const mockSocket = createMockSocket('socket-abc') as Socket;
      const mockPayload: JwtPayload = { sub: userId, email: 'test@example.com', username: 'testuser' };

      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await gateway.handleAuthenticate({ token }, mockSocket);
      
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

