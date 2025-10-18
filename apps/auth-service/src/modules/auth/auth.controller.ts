import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      const errorObj = error as {
        message?: string;
        name?: string;
        status?: number;
      };
      throw new RpcException({
        response: {
          message: errorObj.message || 'Internal server error',
          error: errorObj.name?.replace('Exception', '') || 'Error',
          statusCode: errorObj.status || 500,
        },
        status: errorObj.status || 500,
        message: errorObj.message || 'Internal server error',
        name: errorObj.name,
      });
    }
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refresh(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @MessagePattern({ cmd: 'validate-user' })
  async validateUser(@Payload() userId: string) {
    return this.authService.validateUser(userId);
  }

  @MessagePattern({ cmd: 'revoke-token' })
  async revokeToken(@Payload() token: string) {
    await this.authService.revokeRefreshToken(token);
    return { success: true };
  }
}

