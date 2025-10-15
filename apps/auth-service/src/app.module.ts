import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.dbConfig,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtConfig.secret,
        signOptions: { expiresIn: configService.jwtConfig.accessTokenExpiration },
      }),
    }),
    AuthModule,
    HealthModule,
    SchedulerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

