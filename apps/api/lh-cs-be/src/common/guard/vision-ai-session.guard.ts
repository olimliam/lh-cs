import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { VisionAiSessionService } from '@/application/service/vision-ai-session.service';

@Injectable()
export class VisionAiSessionGuard implements CanActivate {
  constructor(
    private readonly visionAiSessionService: VisionAiSessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Vision AI session token is required');
    }

    const payload = await this.visionAiSessionService.verifySessionToken(token);
    request.visionAiSessionPayload = payload;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      return null;
    }

    const [scheme, value] = authorization.split(' ');
    if (scheme !== 'Bearer' || !value) {
      return null;
    }

    return value;
  }
}
