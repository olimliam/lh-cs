import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const ExtractAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const accessToken = authHeader.split(' ')[1]; // Extract Bearer token

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    return accessToken;
  }
);
