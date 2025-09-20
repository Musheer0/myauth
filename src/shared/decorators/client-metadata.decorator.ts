/* eslint-disable  @typescript-eslint/no-unsafe-member-access */

/* eslint-disable   @typescript-eslint/no-unsafe-assignment*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const forwarded = req.headers['x-forwarded-for'];
    const ip: string =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress;

    const userAgent = (req.headers['user-agent'] as string) || '';
    return {
      ip,
      user_agent: userAgent,
    };
  },
);
