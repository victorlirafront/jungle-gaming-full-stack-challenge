import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_CONSTANTS } from '../constants';

@Injectable()
export class RegisterThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.body?.email || req.ip;
  }

  protected async getLimit(): Promise<number> {
    return APP_CONSTANTS.RATE_LIMIT.REGISTER.LIMIT;
  }

  protected async getTtl(): Promise<number> {
    return APP_CONSTANTS.RATE_LIMIT.REGISTER.TTL;
  }
}

