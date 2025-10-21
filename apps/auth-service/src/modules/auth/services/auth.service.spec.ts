import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, RefreshToken } from '../../../entities';
import { AUTH_CONSTANTS } from '../../../common';

jest.mock('bcrypt');

const createMockQueryBuilder = () => ({
  where: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
});

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
};

const mockRefreshTokenRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const createMockUser = (overrides = {}): User => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  password: '$2b$10$hashedPassword',
  fullName: 'Test User',
  isActive: true,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: typeof mockUserRepository;
  let refreshTokenRepository: typeof mockRefreshTokenRepository;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = mockUserRepository;
    refreshTokenRepository = mockRefreshTokenRepository;
    jwtService = mockJwtService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'Password123',
      fullName: 'New User',
    };

    it('should register a new user successfully', async () => {
      const mockUser = createMockUser({
        email: registerDto.email,
        username: registerDto.username,
        fullName: registerDto.fullName,
      });
      const mockAccessToken = 'access-token-123';
      const mockRefreshTokenValue = 'refresh-token-123';

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshTokenValue);
      refreshTokenRepository.create.mockReturnValue({ token: mockRefreshTokenValue });
      refreshTokenRepository.save.mockResolvedValue({ token: mockRefreshTokenValue });

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: registerDto.email }, { username: registerDto.username }],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        username: registerDto.username,
        password: '$2b$10$hashedPassword',
        fullName: registerDto.fullName,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshTokenValue);
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = createMockUser({ email: registerDto.email });

      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('Email already exists');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      const existingUser = createMockUser({
        email: 'different@example.com',
        username: registerDto.username,
      });

      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('Username already exists');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      const mockUser = createMockUser();

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token');
      refreshTokenRepository.create.mockReturnValue({ token: 'refresh' });
      refreshTokenRepository.save.mockResolvedValue({ token: 'refresh' });

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    });

    it('should generate tokens after successful registration', async () => {
      const mockUser = createMockUser();

      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token');
      refreshTokenRepository.create.mockReturnValue({ token: 'refresh' });
      refreshTokenRepository.save.mockResolvedValue({ token: 'refresh' });

      const result = await service.register(registerDto);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(refreshTokenRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    const loginDto = {
      emailOrUsername: 'test@example.com',
      password: 'Password123',
    };

    it('should login successfully with email', async () => {
      const mockUser = createMockUser();
      const mockAccessToken = 'access-token-123';
      const mockRefreshTokenValue = 'refresh-token-123';

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshTokenValue);
      refreshTokenRepository.create.mockReturnValue({ token: mockRefreshTokenValue });
      refreshTokenRepository.save.mockResolvedValue({ token: mockRefreshTokenValue });

      const result = await service.login(loginDto);

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshTokenValue);
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      });
    });

    it('should login successfully with username', async () => {
      const loginDtoWithUsername = {
        emailOrUsername: 'testuser',
        password: 'Password123',
      };
      const mockUser = createMockUser();
      const mockAccessToken = 'access-token-123';
      const mockRefreshTokenValue = 'refresh-token-123';

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshTokenValue);
      refreshTokenRepository.create.mockReturnValue({ token: mockRefreshTokenValue });
      refreshTokenRepository.save.mockResolvedValue({ token: mockRefreshTokenValue });

      const result = await service.login(loginDtoWithUsername);

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = createMockUser();

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user account is inactive', async () => {
      const mockUser = createMockUser({ isActive: false });

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User account is inactive');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = {
      refreshToken: 'refresh-token-123',
    };

    it('should refresh tokens successfully with valid refresh token', async () => {
      const mockUser = createMockUser();
      const mockStoredToken = {
        id: 'token-id-123',
        token: refreshTokenDto.refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        revoked: false,
        createdAt: new Date(),
        user: mockUser,
      };
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      refreshTokenRepository.findOne.mockResolvedValue(mockStoredToken);
      jwtService.verifyAsync.mockResolvedValue({});
      refreshTokenRepository.save.mockResolvedValueOnce({ ...mockStoredToken, revoked: true });
      jwtService.signAsync.mockResolvedValueOnce(newAccessToken).mockResolvedValueOnce(newRefreshToken);
      refreshTokenRepository.create.mockReturnValue({ token: newRefreshToken });
      refreshTokenRepository.save.mockResolvedValueOnce({ token: newRefreshToken });

      const result = await service.refreshTokens(refreshTokenDto);

      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: refreshTokenDto.refreshToken },
        relations: ['user'],
      });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        expect.objectContaining({ secret: expect.any(String) })
      );
      expect(refreshTokenRepository.save).toHaveBeenCalledWith({
        ...mockStoredToken,
        revoked: true,
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken', newAccessToken);
      expect(result).toHaveProperty('refreshToken', newRefreshToken);
    });

    it('should throw UnauthorizedException when refresh token does not exist', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow('Invalid refresh token');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      const mockUser = createMockUser();
      const mockStoredToken = {
        id: 'token-id-123',
        token: refreshTokenDto.refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        revoked: true,
        createdAt: new Date(),
        user: mockUser,
      };

      refreshTokenRepository.findOne.mockResolvedValue(mockStoredToken);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow('Refresh token has been revoked');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const mockUser = createMockUser();
      const mockStoredToken = {
        id: 'token-id-123',
        token: refreshTokenDto.refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 86400000),
        revoked: false,
        createdAt: new Date(),
        user: mockUser,
      };

      refreshTokenRepository.findOne.mockResolvedValue(mockStoredToken);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow('Refresh token has expired');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const userId = 'user-123';
    const changePasswordDto = {
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    };

    it('should change password successfully with correct current password', async () => {
      const mockUser = createMockUser({ id: userId });
      const newHashedPassword = '$2b$10$newHashedPassword';

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.delete.mockResolvedValue({});

      const result = await service.changePassword(userId, changePasswordDto);

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
      expect(userRepository.save).toHaveBeenCalled();
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow('User not found');

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const mockUser = createMockUser({ id: userId });

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow('Current password is incorrect');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should revoke all refresh tokens after password change', async () => {
      const mockUser = createMockUser({ id: userId });

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$newHashedPassword');
      userRepository.save.mockResolvedValue(mockUser);
      refreshTokenRepository.delete.mockResolvedValue({});

      await service.changePassword(userId, changePasswordDto);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId });
    });
  });

  describe('validateUser', () => {
    const userId = 'user-123';

    it('should return user when user exists and is active', async () => {
      const mockUser = createMockUser({ id: userId, isActive: true });

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when user account is inactive', async () => {
      const mockUser = createMockUser({ id: userId, isActive: false });

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser(userId)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateUser(userId)).rejects.toThrow('User account is inactive');
    });
  });
});

