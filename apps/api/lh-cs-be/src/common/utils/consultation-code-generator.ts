import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsultationCodeGenerator {
  /**
   * 6자리 상담실 번호 생성 (100000 ~ 999999)
   */
  generateRoomNumber(): string {
    const number = Math.floor(Math.random() * 900000) + 100000;
    return number.toString();
  }

  /**
   * 4자리 입장 코드 생성 (알파벳 + 숫자)
   */
  generateEnterCode(): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 상담 코드 생성 (접두사 + 타임스탬프 + 랜덤)
   */
  generateConsultationCode(prefix: string = 'CS'): string {
    const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * UUID 기반 방문자 ID 생성
   */
  generateVisitorId(): string {
    return 'visitor_' + Math.random().toString(36).substr(2, 9);
  }
}
