import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, RefreshToken } from '../../../entities';
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto, ChangePasswordDto } from '../dto';
import { AuthResponse, JwtPayload } from '../interfaces/auth-response.interface';
import { AUTH_CONSTANTS } from '../../../common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, fullName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);

    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { emailOrUsername, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :emailOrUsername OR user.username = :emailOrUsername', { emailOrUsername })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || AUTH_CONSTANTS.DEFAULT_JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);

    return this.generateTokens(storedToken.user);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  async findAllUsers(): Promise<Array<{ id: string; username: string; email: string }>> {
    const users = await this.userRepository.find({
      where: { isActive: true },
      select: ['id', 'username', 'email'],
      order: { username: 'ASC' },
    });

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; username: string; fullName?: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'username', 'fullName'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{ id: string; email: string; username: string; fullName?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateProfileDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      user.username = updateProfileDto.username;
    }

    if (updateProfileDto.fullName !== undefined) {
      user.fullName = updateProfileDto.fullName;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.refreshTokenRepository.delete({ userId });

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || AUTH_CONSTANTS.DEFAULT_JWT_SECRET,
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || AUTH_CONSTANTS.DEFAULT_JWT_REFRESH_SECRET,
      expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRATION,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRATION_DAYS);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken) {
      refreshToken.revoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}

