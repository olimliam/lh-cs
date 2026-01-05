import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class VisionAiAudienceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedAudience =
      this.configService.get<string>('VISION_AI_APP_ID');
    const payload =
      request.visionAiEptPayload ?? request.visionAiSessionPayload;

    if (!payload || payload.aud !== expectedAudience) {
      throw new ForbiddenException('Vision AI audience mismatch');
    }

    return true;
  }
}
