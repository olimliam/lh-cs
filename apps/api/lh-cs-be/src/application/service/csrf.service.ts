import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // validateToken 메소드는 제거 (세션에서 직접 비교)
}
