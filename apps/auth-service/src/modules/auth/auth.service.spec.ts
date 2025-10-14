import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, RefreshToken } from '../../entities';
import { RegisterDto, LoginDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-uuid',
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce('access_token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh_token');
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: 'existing-uuid',
        email: registerDto.email,
        username: 'different',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = {
        id: 'existing-uuid',
        email: 'different@example.com',
        username: registerDto.username,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Username already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      emailOrUsername: 'test@example.com',
      password: 'Password123',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce('access_token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh_token');
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
        isActive: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'User account is inactive',
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if found and active', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-uuid');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        username: 'testuser',
        isActive: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser('user-uuid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

