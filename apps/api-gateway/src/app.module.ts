import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule, ConfigService } from './config';
import { RpcExceptionInterceptor } from './common';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.throttlerConfig.ttl,
          limit: configService.throttlerConfig.limit,
        },
      ],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.jwtConfig;
        return {
          secret: config.secret,
          signOptions: { expiresIn: config.expiresIn },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any; // NestJS JWT module expects any due to interface compatibility
      },
    }),
    AuthModule,
    TasksModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExceptionInterceptor,
    },
  ],
})
export class AppModule {}

