/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { redis } from 'src/shared/redis';

@Injectable()
export class EmailThrottlerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.body?.email) {
      return false;
    }
    const email: string = request.body.email;
    const key = `rate:limiter:email:${email}`;
    const exists = await redis.get<number>(key);
    if (exists) {
      if (exists >= 2) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      await redis.incr(key);
      return true;
    }
    await redis.set(key, 1, { ex: 60 });
    return true;
  }
}
