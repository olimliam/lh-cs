import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const VISION_AI_SCOPE_KEY = 'visionAiScopes';

@Injectable()
export class VisionAiScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes =
      this.reflector.getAllAndOverride<string[]>(VISION_AI_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredScopes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const payload =
      request.visionAiEptPayload ?? request.visionAiSessionPayload;

    if (!payload) {
      throw new ForbiddenException('Vision AI token payload missing');
    }

    const tokenScopes = new Set(
      (payload.scope ?? '')
        .split(' ')
        .map((scope) => scope.trim())
        .filter(Boolean)
    );

    const hasAllScopes = requiredScopes.every((scope) =>
      tokenScopes.has(scope)
    );

    if (!hasAllScopes) {
      throw new ForbiddenException('Vision AI insufficient scope');
    }

    return true;
  }
}
