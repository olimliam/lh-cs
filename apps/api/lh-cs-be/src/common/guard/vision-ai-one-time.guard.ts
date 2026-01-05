import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { VisionAiSessionService } from '@/application/service/vision-ai-session.service';

@Injectable()
export class VisionAiOneTimeGuard implements CanActivate {
  constructor(
    private readonly visionAiSessionService: VisionAiSessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const payload = request.visionAiEptPayload;
    if (!payload) {
      throw new ForbiddenException('Vision AI EPT payload missing');
    }

    await this.visionAiSessionService.consumeEphemeralToken(payload.jti);
    return true;
  }
}
