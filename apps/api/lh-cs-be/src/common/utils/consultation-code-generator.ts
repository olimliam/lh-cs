import { Injectable } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class ConsultationCodeGenerator {
  /**
   * 6자리 상담실 번호 생성 (100000 ~ 999999)
   * crypto.randomInt()를 사용하여 암호학적으로 안전한 난수 생성
   */
  generateRoomNumber(): string {
    const number = randomInt(100000, 1000000);
    return number.toString();
  }

  /**
   * 4자리 입장 코드 생성 (숫자)
   * crypto.randomInt()를 사용하여 암호학적으로 안전한 난수 생성
   */
  generateEnterCode(): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(randomInt(0, chars.length));
    }
    return result;
  }

  /**
   * 상담 코드 생성 (접두사 + 타임스탬프 + 랜덤)
   * crypto.randomInt()를 사용하여 암호학적으로 안전한 난수 생성
   */
  generateConsultationCode(prefix: string = 'CS'): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = randomInt(0, 1000).toString().padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * UUID 기반 방문자 ID 생성
   * crypto.randomBytes()를 사용하여 암호학적으로 안전한 난수 생성
   */
  generateVisitorId(): string {
    return 'visitor_' + randomBytes(6).toString('hex');
  }
}
