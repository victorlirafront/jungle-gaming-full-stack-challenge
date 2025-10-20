import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, RefreshToken } from '../../../entities';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
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
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
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

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
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

      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshTokenValue);
      refreshTokenRepository.create.mockReturnValue({ token: mockRefreshTokenValue });
      refreshTokenRepository.save.mockResolvedValue({ token: mockRefreshTokenValue });

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: loginDto.emailOrUsername }, { username: loginDto.emailOrUsername }],
      });
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

      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshTokenValue);
      refreshTokenRepository.create.mockReturnValue({ token: mockRefreshTokenValue });
      refreshTokenRepository.save.mockResolvedValue({ token: mockRefreshTokenValue });

      const result = await service.login(loginDtoWithUsername);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: loginDtoWithUsername.emailOrUsername }, { username: loginDtoWithUsername.emailOrUsername }],
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = createMockUser();

      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user account is inactive', async () => {
      const mockUser = createMockUser({ isActive: false });

      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User account is inactive');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});

