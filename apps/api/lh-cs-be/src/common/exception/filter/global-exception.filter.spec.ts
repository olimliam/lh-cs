import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { GlobalExceptionFilter } from './global-exception.filter';
import { UserErrorCode } from '@/common/exception/error';

describe('GlobalExceptionFilter - QueryFailedError 매핑', () => {
  const logger = {
    setContext: jest.fn(),
    error: jest.fn(),
  } as any;

  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response: any = { status };
    const request: any = {
      method: 'POST',
      originalUrl: '/auth/register',
      headers: {},
    };

    const host: ArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as any;

    return { host, status, json };
  };

  it('전화번호 유니크 제약 위반 시 CustomException 응답으로 매핑한다', () => {
    const filter = new GlobalExceptionFilter(logger);
    const { host, status, json } = createHost();

    const driverError = Object.assign(new Error('Duplicate entry'), {
      code: 'ER_DUP_ENTRY',
      errno: 1062,
      constraint: 'phone_hash_unique',
      sqlMessage:
        "Duplicate entry 'hashed-phone' for key 'users.phone_hash_unique'",
    });

    const exception = new QueryFailedError('INSERT INTO users ...', [], driverError);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN,
      })
    );
  });
});
