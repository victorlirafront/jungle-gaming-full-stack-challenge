import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { of } from 'rxjs';
import { JwtAuthGuard, JwtPayload } from '../../../common';

const mockAuthClient = {
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

const createMockAuthResponse = () => ({
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
  },
});

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: 'AUTH_SERVICE', useValue: mockAuthClient },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should send register message to auth service', () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123',
      };
      const mockResponse = createMockAuthResponse();

      mockAuthClient.send.mockReturnValue(of(mockResponse));

      const result = controller.register(registerDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'register' }, registerDto);
      expect(result).toBeDefined();
    });
  });

  describe('login', () => {
    it('should send login message to auth service', () => {
      const loginDto = {
        emailOrUsername: 'test@example.com',
        password: 'Password123',
      };
      const mockResponse = createMockAuthResponse();

      mockAuthClient.send.mockReturnValue(of(mockResponse));

      const result = controller.login(loginDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'login' }, loginDto);
      expect(result).toBeDefined();
    });
  });

  describe('refresh', () => {
    it('should send refresh message to auth service', () => {
      const refreshTokenDto = {
        refreshToken: 'refresh-token-123',
      };
      const mockResponse = createMockAuthResponse();

      mockAuthClient.send.mockReturnValue(of(mockResponse));

      const result = controller.refresh(refreshTokenDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'refresh' }, refreshTokenDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAllUsers', () => {
    it('should send find-all-users message to auth service', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user1', email: 'user1@example.com' },
        { id: 'user-2', username: 'user2', email: 'user2@example.com' },
      ];

      mockAuthClient.send.mockReturnValue(of(mockUsers));

      const result = await controller.findAllUsers();

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'find-all-users' }, {});
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getProfile', () => {
    it('should send get-profile message with userId from request', async () => {
      const user = createMockUser();
      const req = { user };
      const mockProfile = {
        id: user.sub,
        email: user.email,
        username: user.username,
        fullName: 'Test User',
      };

      mockAuthClient.send.mockReturnValue(of(mockProfile));

      const result = await controller.getProfile(req);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'get-profile' }, user.sub);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should send update-profile message with userId and data', async () => {
      const user = createMockUser();
      const req = { user };
      const updateProfileDto = {
        username: 'newusername',
        fullName: 'New Full Name',
      };
      const mockProfile = {
        id: user.sub,
        email: user.email,
        username: 'newusername',
        fullName: 'New Full Name',
      };

      mockAuthClient.send.mockReturnValue(of(mockProfile));

      const result = await controller.updateProfile(req, updateProfileDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'update-profile' }, {
        userId: user.sub,
        data: updateProfileDto,
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('changePassword', () => {
    it('should send change-password message with userId and passwords', async () => {
      const user = createMockUser();
      const req = { user };
      const changePasswordDto = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
      };
      const mockResponse = { message: 'Password changed successfully' };

      mockAuthClient.send.mockReturnValue(of(mockResponse));

      const result = await controller.changePassword(req, changePasswordDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'change-password' }, {
        userId: user.sub,
        data: changePasswordDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

