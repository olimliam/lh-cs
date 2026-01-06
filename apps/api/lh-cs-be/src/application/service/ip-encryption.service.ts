import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHmac } from 'crypto';
import { normalizeIp } from '@/common/utils/ip-utils';

@Injectable()
export class IpEncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const keySource = this.configService.get<string>('IP_ENCRYPTION_KEY');
    if (!keySource) {
      throw new InternalServerErrorException(
        'IP_ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.'
      );
    }

    this.key = this.normalizeKey(keySource);
  }

  encrypt(ipAddress?: string | null): string | undefined {
    const normalized = normalizeIp(ipAddress);
    if (!normalized) {
      return undefined;
    }

    const lowerIp = normalized.toLowerCase();
    const iv = this.createDeterministicIv(lowerIp);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(lowerIp, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // 단일 base64 문자열로 인코딩해 컬럼 길이(기존 45 제한) 내에서 수용
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(payload?: string | null): string | undefined {
    if (!payload) {
      return undefined;
    }

    // 1) 최신 base64 포맷(iv|tag|cipher) 시도
    const decryptedFromBase64 = this.tryDecryptBase64(payload);
    if (decryptedFromBase64) {
      return decryptedFromBase64;
    }

    // 2) 구형(hex 3파트) 포맷 호환 처리
    return this.tryDecryptLegacyHex(payload);
  }

  private normalizeKey(value: string): Buffer {
    const trimmed = value.trim();

    try {
      const base64 = Buffer.from(trimmed, 'base64');
      if (base64.length === 32) {
        return base64;
      }
    } catch (error) {
      // 시큐어 코딩: base64 디코딩 실패 시 다른 포맷으로 fallback
      console.debug('[IpEncryptionService] base64 키 파싱 실패, 다른 포맷 시도:', error);
    }

    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length === 64) {
      return Buffer.from(trimmed, 'hex');
    }

    const utf8 = Buffer.from(trimmed, 'utf8');
    if (utf8.length === 32) {
      return utf8;
    }

    throw new InternalServerErrorException(
      'IP_ENCRYPTION_KEY는 32바이트(base64/hex/utf8)여야 합니다.'
    );
  }

  private createDeterministicIv(lowerIp: string): Buffer {
    return createHmac('sha256', this.key).update(lowerIp).digest().subarray(0, 12);
  }

  private tryDecryptBase64(payload: string): string | undefined {
    try {
      const bytes = Buffer.from(payload, 'base64');
      if (bytes.length < 12 + 16 + 1) {
        return undefined;
      }

      const iv = bytes.subarray(0, 12);
      const authTag = bytes.subarray(12, 28);
      const encrypted = bytes.subarray(28);

      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      return undefined;
    }
  }

  private tryDecryptLegacyHex(payload: string): string | undefined {
    const [ivHex, encryptedHex, authTagHex] = payload.split(':');
    if (!ivHex || !encryptedHex || !authTagHex) {
      return undefined;
    }

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      return undefined;
    }
  }
}
