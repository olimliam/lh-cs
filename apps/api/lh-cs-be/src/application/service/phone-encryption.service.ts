import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

export interface EncryptedPhonePayload {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
  hash: string;
}

@Injectable()
export class PhoneEncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const keySource = this.configService.get<string>('PHONE_ENCRYPTION_KEY');
    if (!keySource) {
      throw new InternalServerErrorException(
        'PHONE_ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다.'
      );
    }

    this.key = this.normalizeKey(keySource);
  }

  private normalizeKey(value: string): Buffer {
    const trimmed = value.trim();

    // base64 시도
    try {
      const buf = Buffer.from(trimmed, 'base64');
      if (buf.length === 32) {
        return buf;
      }
    } catch (error) {
      // fallthrough
    }

    // hex 시도
    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length === 64) {
      return Buffer.from(trimmed, 'hex');
    }

    // utf8 시도
    const utf8Buf = Buffer.from(trimmed, 'utf8');
    if (utf8Buf.length === 32) {
      return utf8Buf;
    }

    throw new InternalServerErrorException(
      'PHONE_ENCRYPTION_KEY는 32바이트(base64/hex/utf8)여야 합니다.'
    );
  }

  encrypt(plainPhone: string): EncryptedPhonePayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainPhone, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv,
      authTag,
      hash: this.hash(plainPhone),
    };
  }

  decrypt(payload: { encrypted: Buffer; iv: Buffer; authTag: Buffer }): string {
    const decipher = createDecipheriv('aes-256-gcm', this.key, payload.iv);
    decipher.setAuthTag(payload.authTag);
    const decrypted = Buffer.concat([
      decipher.update(payload.encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  hash(plainPhone: string): string {
    return createHash('sha256').update(plainPhone).digest('hex');
  }
}
