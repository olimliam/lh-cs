import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import jwt from 'jsonwebtoken';
import { ZoomRole } from './zoom-video-role.enum';
import { ZoomSessionLogRepository } from '@/infrastructure/repository/zoom-session-log.repository';
import { ZoomSessionLogEntity } from '@/infrastructure/repository/entity/zoom-session-log.entity';

type GenerateVideoTokenParams = {
  sessionName: string;
  role: ZoomRole;
  userIdentity: string;
};

type CreateVideoTokenParams = {
  consultationId: string;
  role: ZoomRole;
  userId: string;
  userName: string;
};

type CreateVideoTokenResult = {
  sessionName: string;
  token: string;
  sdkKey: string;
  userName: string;
};

@Injectable()
export class ZoomVideoSdkService {
  private readonly sdkKey: string;
  private readonly sdkSecret: string;
  private readonly sessionPrefix: string;
  private readonly zoomApiToken: string;
  private readonly zoomApiBaseUrl: string;
  private readonly logger = new Logger(ZoomVideoSdkService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly zoomSessionLogRepository: ZoomSessionLogRepository
  ) {
    this.sdkKey =
      this.configService.get<string>('ZOOM_VIDEO_SDK_KEY') ||
      process.env.ZOOM_VIDEO_SDK_KEY ||
      '';
    this.sdkSecret =
      this.configService.get<string>('ZOOM_VIDEO_SDK_SECRET') ||
      process.env.ZOOM_VIDEO_SDK_SECRET ||
      '';
    this.sessionPrefix =
      this.configService.get<string>('ZOOM_VIDEO_SESSION_PREFIX') ||
      process.env.ZOOM_VIDEO_SESSION_PREFIX ||
      'zoom-consultation-';
    this.zoomApiToken =
      this.configService.get<string>('ZOOM_VIDEO_API_TOKEN') ||
      process.env.ZOOM_VIDEO_API_TOKEN ||
      '';
    this.zoomApiBaseUrl =
      this.configService.get<string>('ZOOM_VIDEO_API_BASE_URL') ||
      process.env.ZOOM_VIDEO_API_BASE_URL ||
      'https://api.zoom.us/v2';

    if (!this.sdkKey || !this.sdkSecret) {
      throw new Error(
        'ZOOM Video SDK key/secret가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
      );
    }
  }

  buildSessionName(consultationId: string): string {
    return `${this.sessionPrefix}${consultationId}`;
  }

  private generateVideoToken(params: GenerateVideoTokenParams): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60; // 1시간 유효
    const roleType = params.role === ZoomRole.HOST ? 1 : 0;

    const payload = {
      app_key: this.sdkKey,
      tpc: params.sessionName,
      role_type: roleType,
      version: 1,
      iat: issuedAt,
      exp: expiresAt,
      user_identity: params.userIdentity,
    };

    return jwt.sign(payload, this.sdkSecret, { algorithm: 'HS256' });
  }

  createVideoToken(params: CreateVideoTokenParams): CreateVideoTokenResult {
    const sessionName = this.buildSessionName(params.consultationId);
    const token = this.generateVideoToken({
      sessionName,
      role: params.role,
      userIdentity: params.userId,
    });

    return {
      sessionName,
      token,
      sdkKey: this.sdkKey,
      userName: params.userName,
    };
  }

  async logSessionMapping(params: {
    consultationId: string;
    zoomSessionId: string;
  }): Promise<ZoomSessionLogEntity> {
    const { consultationId, zoomSessionId } = params;
    if (!consultationId || !zoomSessionId) {
      throw new BadRequestException(
        'consultationId와 zoomSessionId는 필수 값입니다.'
      );
    }

    const log = await this.zoomSessionLogRepository.upsertLog(
      consultationId,
      zoomSessionId
    );

    this.logger.log(
      `Zoom session mapped to consultation. consultationId=${consultationId}, sessionId=${zoomSessionId}`
    );

    return log;
  }

  async closeSessionsByConsultation(
    consultationId: string
  ): Promise<{ closedSessionIds: string[] }> {
    if (!consultationId) {
      throw new BadRequestException('consultationId is required');
    }

    const sessionLogs =
      await this.zoomSessionLogRepository.findOpenByConsultationId(
        consultationId
      );
    const closedSessionIds: string[] = [];

    for (const log of sessionLogs) {
      try {
        await this.endSession(log.zoomSessionId);
        await this.zoomSessionLogRepository.markClosed(log.id);
        closedSessionIds.push(log.zoomSessionId);
      } catch (error) {
        const isNotFound = error instanceof NotFoundException;
        const message =
          error?.message ||
          (typeof error === 'string'
            ? error
            : 'Unknown error while closing Zoom session');

        if (isNotFound) {
          await this.zoomSessionLogRepository.markClosed(log.id);
          closedSessionIds.push(log.zoomSessionId);
          this.logger.warn(
            `Zoom session already closed or missing: ${log.zoomSessionId}`
          );
          continue;
        }

        await this.zoomSessionLogRepository.markError(log.id, message);
        this.logger.error(
          `Failed to close Zoom session ${log.zoomSessionId} for consultation ${consultationId}: ${message}`,
          error instanceof Error ? error.stack : undefined
        );
      }
    }

    return { closedSessionIds };
  }

  private encodeSessionId(sessionId: string): string {
    const shouldDoubleEncode =
      sessionId.includes('+') ||
      sessionId.startsWith('/') ||
      sessionId.includes('/') || // Zoom 포럼 사례: 어디든 '/' 포함 시 2중 인코딩 필요
      sessionId.includes('//');
    if (!shouldDoubleEncode) {
      return sessionId;
    }
    const encodedOnce = encodeURIComponent(sessionId);
    return encodeURIComponent(encodedOnce); // double encode path segment
  }

  async deleteSession(
    sessionId: string
  ): Promise<{ encodedSessionId: string }> {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    if (!this.zoomApiToken) {
      throw new InternalServerErrorException(
        'ZOOM_VIDEO_API_TOKEN is not configured'
      );
    }

    const encodedSessionId = this.encodeSessionId(sessionId);
    const url = `${this.zoomApiBaseUrl}/videosdk/sessions/${encodedSessionId}`;

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            Authorization: `Bearer ${this.zoomApiToken}`,
          },
        })
      );
      this.logger.log(
        `Zoom Video SDK session deleted: raw=${sessionId}, encoded=${encodedSessionId}`
      );
      return { encodedSessionId };
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      const codeStr = code?.toString?.();

      this.logger.error(
        `Failed to delete Zoom session ${sessionId}: status=${status}, code=${code}, message=${error?.message}`
      );

      if (status === 400 && code === 3000) {
        throw new BadRequestException(
          'Cannot delete a session that has already started (Zoom error 3000)'
        );
      }
      if (status === 404 && (code === 3001 || codeStr === '3001')) {
        throw new NotFoundException(
          `Zoom session does not exist (Zoom error 3001): ${sessionId}`
        );
      }
      if (status === 404 && (code === 2300 || codeStr === '2300')) {
        throw new NotFoundException(
          `Zoom session does not exist (Zoom error 2300): ${sessionId}`
        );
      }

      throw new InternalServerErrorException(
        'Failed to delete Zoom Video SDK session'
      );
    }
  }

  async endSession(sessionId: string): Promise<{ encodedSessionId: string }> {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    if (!this.zoomApiToken) {
      throw new InternalServerErrorException(
        'ZOOM_VIDEO_API_TOKEN is not configured'
      );
    }

    const encodedSessionId = this.encodeSessionId(sessionId);
    const url = `${this.zoomApiBaseUrl}/videosdk/sessions/${encodedSessionId}/status`;
    const payload = { action: 'end' };

    try {
      await firstValueFrom(
        this.httpService.put(url, payload, {
          headers: { Authorization: `Bearer ${this.zoomApiToken}` },
        })
      );
      this.logger.log(
        `Zoom Video SDK session ended: raw=${sessionId}, encoded=${encodedSessionId}`
      );
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      const codeStr = code?.toString?.();

      this.logger.error(
        `Failed to end Zoom session ${sessionId}: status=${status}, code=${code}, message=${error?.message}`
      );

      if (status === 404 && (code === 3001 || codeStr === '3001')) {
        throw new NotFoundException(
          `Zoom session does not exist (Zoom error 3001): ${sessionId}`
        );
      }
      if (status === 404 && (code === 2300 || codeStr === '2300')) {
        throw new NotFoundException(
          `Zoom session does not exist (Zoom error 2300): ${sessionId}`
        );
      }

      throw new InternalServerErrorException(
        'Failed to end Zoom Video SDK session'
      );
    }

    return { encodedSessionId };
  }

  // 테스트/진단용: 세션 ID를 Zoom 요구사항에 맞게 인코딩한 결과를 반환
  encodeSessionIdForTest(sessionId: string): { encodedSessionId: string } {
    if (!sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    const encodedSessionId = this.encodeSessionId(sessionId);
    return { encodedSessionId };
  }
}
