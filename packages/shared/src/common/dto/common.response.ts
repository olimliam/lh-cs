import { HttpStatus } from '@nestjs/common';

export class CommonResponse<T> {
  status: HttpStatus;
  message: string | null;
  data: T | null;

  constructor(status: HttpStatus, message: string, data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
