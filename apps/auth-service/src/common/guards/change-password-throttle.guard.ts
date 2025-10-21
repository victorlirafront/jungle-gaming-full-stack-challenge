import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_CONSTANTS } from '../constants';

@Injectable()
export class ChangePasswordThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.sub || req.ip;
  }

  protected async getLimit(): Promise<number> {
    return APP_CONSTANTS.RATE_LIMIT.CHANGE_PASSWORD.LIMIT;
  }

  protected async getTtl(): Promise<number> {
    return APP_CONSTANTS.RATE_LIMIT.CHANGE_PASSWORD.TTL;
  }
}

