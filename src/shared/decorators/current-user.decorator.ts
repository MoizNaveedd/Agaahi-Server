import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request['user']) {
      throw new UnauthorizedException('Authorization failed');
    }
    return request['user'];
  },
);

export const CurrentCashier = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request['cashier']) {
      throw new UnauthorizedException('Authorization failed');
    }
    return request['cashier'];
  },
);

export const CurrentDevice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request['device']) {
      throw new UnauthorizedException('Authorization failed');
    }

    return request['device'];
  },
);

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request['admin']) {
      throw new UnauthorizedException('Authorization failed');
    }
    return request['admin'];
  },
);
