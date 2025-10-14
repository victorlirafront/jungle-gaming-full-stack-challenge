import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 10,
      },
    ]),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

