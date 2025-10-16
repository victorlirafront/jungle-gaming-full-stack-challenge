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
    } catch (error: any) {
      throw new RpcException({
        response: {
          message: error.message || 'Internal server error',
          error: error.name?.replace('Exception', '') || 'Error',
          statusCode: error.status || 500,
        },
        status: error.status || 500,
        message: error.message || 'Internal server error',
        name: error.name,
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

