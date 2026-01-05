import { BadRequestException } from '@nestjs/common';

export class PasswordValidationException extends BadRequestException {
  constructor(errors: string[]) {
    const message = {
      error: 'Password Validation Failed',
      message: '비밀번호가 보안 정책을 만족하지 않습니다.',
      details: errors,
      timestamp: new Date().toISOString(),
    };

    super(message);
  }
}

export interface PasswordValidationErrorResponse {
  error: string;
  message: string;
  details: string[];
  timestamp: string;
  statusCode: number;
}
