import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class VisionAiOriginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedOrigin = this.configService.get<string>(
      'VISION_AI_CHILD_ORIGIN'
    );
    const payload = request.visionAiEptPayload;
    const actualOrigin = payload?.origin ?? 'undefined';
    if (!payload || payload.origin !== expectedOrigin) {
      // throw new ForbiddenException('Vision AI origin mismatch');

      throw new ForbiddenException(
        `Vision AI origin mismatch: received=${actualOrigin}, expected=${expectedOrigin ?? 'undefined'}`
      );
    }

    return true;
  }
}
