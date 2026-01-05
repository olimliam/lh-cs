import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { VisionAiAuthTokenRepository } from '@/infrastructure/repository/vision-ai-auth-token.repository';
import {
  VisionAiEptPayload,
  VisionAiSessionTokenPayload,
} from '../dto/vision-ai/vision-ai-token.payload';

interface MintVisionAiEptResult {
  token: string;
  expiresIn: number;
}

interface VisionAiRedeemResult {
  token: string;
  expiresIn: number;
}

const SESSION_TOKEN_USE = 'vision-ai-st';
const EPT_TOKEN_USE = 'vision-ai-ept';

@Injectable()
export class VisionAiSessionService {
  private readonly issuer: string;
  private readonly parentOrigin: string;
  private readonly childOrigin: string;
  private readonly appId: string;
  private readonly eptTtlSeconds: number;
  private readonly stTtlSeconds: number;
  private readonly secret: string;
  private readonly scope: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly visionAiTokenRepository: VisionAiAuthTokenRepository
  ) {
    this.issuer =
      this.configService.get<string>('VISION_AI_JWT_ISSUER') ??
      this.configService.get<string>('JWT_ACCESS_ISSUER') ??
      'lh-cs-be';
    this.parentOrigin = this.configService.get<string>(
      'VISION_AI_PARENT_ORIGIN'
    );
    this.childOrigin = this.configService.get<string>('VISION_AI_CHILD_ORIGIN');
    this.appId = this.configService.get<string>('VISION_AI_APP_ID');
    this.eptTtlSeconds = Number(
      this.configService.get<string>('VISION_AI_EPT_TTL_SECONDS') ?? '30'
    );
    this.stTtlSeconds = Number(
      this.configService.get<string>('VISION_AI_ST_TTL_SECONDS') ?? '300'
    );
    this.secret = this.configService.get<string>('JWT_VISION_AI_SECRET');
    this.scope = this.configService.get<string>('VISION_AI_NICKNAME_SCOPE');

    if (!this.parentOrigin || !this.childOrigin || !this.appId) {
      throw new Error(
        'Missing Vision AI configuration. Ensure VISION_AI_PARENT_ORIGIN, VISION_AI_CHILD_ORIGIN, VISION_AI_APP_ID are set.'
      );
    }
    if (!this.secret) {
      throw new Error(
        'Missing Vision AI JWT secret. Ensure VISION_AI_JWT_SECRET is set.'
      );
    }
  }

  getChildOrigin(): string {
    return this.childOrigin;
  }

  getParentOrigin(): string {
    return this.parentOrigin;
  }

  getAudience(): string {
    return this.appId;
  }

  getScope(): string {
    return this.scope;
  }

  async mintEphemeralToken(userId: string): Promise<MintVisionAiEptResult> {
    const jti = randomUUID();
    const payload: VisionAiEptPayload = {
      sub: userId,
      iss: this.issuer,
      aud: this.appId,
      origin: this.childOrigin,
      scope: this.scope,
      jti,
      tokenUse: EPT_TOKEN_USE,
    };

    await this.visionAiTokenRepository.createEptRecord({
      jti,
      userId,
      origin: this.childOrigin,
      audience: this.appId,
      scope: this.scope,
      expiresAt: new Date(Date.now() + this.eptTtlSeconds * 1000),
    });

    const token = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: `${this.eptTtlSeconds}s`,
      notBefore: 0,
    });

    return { token, expiresIn: this.eptTtlSeconds };
  }

  async verifyEphemeralToken(token: string): Promise<VisionAiEptPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<VisionAiEptPayload>(
        token,
        {
          secret: this.secret,
          audience: this.appId,
          issuer: this.issuer,
        }
      );
      if (payload.tokenUse !== EPT_TOKEN_USE) {
        throw new UnauthorizedException('Invalid token use');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Vision AI EPT');
    }
  }

  async consumeEphemeralToken(jti: string): Promise<void> {
    const now = new Date();
    const consumed = await this.visionAiTokenRepository.consumeEpt(jti, now);
    if (!consumed) {
      throw new ForbiddenException('Vision AI EPT already used or expired');
    }
  }

  async issueSessionToken(
    payload: VisionAiEptPayload
  ): Promise<VisionAiRedeemResult> {
    const sessionPayload: VisionAiSessionTokenPayload = {
      sub: payload.sub,
      iss: this.issuer,
      aud: payload.aud,
      scope: payload.scope,
      tokenUse: SESSION_TOKEN_USE,
    };

    const token = await this.jwtService.signAsync(sessionPayload, {
      secret: this.secret,
      expiresIn: `${this.stTtlSeconds}s`,
      notBefore: 0,
    });

    return { token, expiresIn: this.stTtlSeconds };
  }

  async verifySessionToken(
    token: string
  ): Promise<VisionAiSessionTokenPayload> {
    try {
      const payload =
        await this.jwtService.verifyAsync<VisionAiSessionTokenPayload>(token, {
          secret: this.secret,
          audience: this.appId,
          issuer: this.issuer,
        });
      if (payload.tokenUse !== SESSION_TOKEN_USE) {
        throw new UnauthorizedException('Invalid token use');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired Vision AI session token'
      );
    }
  }
}
