import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { QueryFailedError } from 'typeorm';
import { CustomException } from '@/common/exception/custom.exception';
import { CommonResponse } from '@/common/dto/common-response.dto';
import {
  API_ERROR_CATALOG,
  ApiErrorCode,
  DEFAULT_BAD_REQUEST_CODE,
  DEFAULT_ERROR_CODE,
  findErrorCodeByMessage,
  isApiErrorCode,
} from '@/common/exception/error';
import { UserErrorCode } from '@/common/exception/error/user-error-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mappedException =
      exception instanceof QueryFailedError
        ? this.mapQueryFailedError(exception) ?? exception
        : exception;

    const { status, code, message } =
      this.resolveExceptionPayload(mappedException);

    this.logException({ exception, request, status, code, message });

    const errorResponse = CommonResponse.error(code, message);
    response.status(status).json(errorResponse);
  }

  private resolveExceptionPayload(exception: unknown): {
    status: HttpStatus;
    code: ApiErrorCode;
    message: string;
  } {
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: ApiErrorCode = DEFAULT_ERROR_CODE;
    let message: string = API_ERROR_CATALOG[DEFAULT_ERROR_CODE].message;

    if (exception instanceof CustomException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as {
        code?: string;
        message?: string;
      };

      if (exceptionResponse?.code && isApiErrorCode(exceptionResponse.code)) {
        code = exceptionResponse.code;
      }

      message = exceptionResponse?.message ?? API_ERROR_CATALOG[code].message;
      return { status, code, message };
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        if (status === HttpStatus.BAD_REQUEST) {
          code = DEFAULT_BAD_REQUEST_CODE;
        }
        message = exceptionResponse;
        return { status, code, message };
      }

      if (exceptionResponse && typeof exceptionResponse === 'object') {
        const { code: responseCode, message: responseMessage } =
          exceptionResponse as {
            code?: string;
            message?: string | string[];
          };

        if (responseCode && isApiErrorCode(responseCode)) {
          code = responseCode;
        } else if (status === HttpStatus.BAD_REQUEST) {
          code = DEFAULT_BAD_REQUEST_CODE;
        }

        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        } else if (responseMessage) {
          message = responseMessage;
        } else {
          message = API_ERROR_CATALOG[code].message;
        }

        const derivedCode = findErrorCodeByMessage(message);
        if (derivedCode) {
          code = derivedCode;
          message = API_ERROR_CATALOG[derivedCode].message;
        }

        return { status, code, message };
      }
    }

    if (exception instanceof Error) {
      message = exception.message || API_ERROR_CATALOG[code].message;
      const derivedCode = findErrorCodeByMessage(message);
      if (derivedCode) {
        code = derivedCode;
        message = API_ERROR_CATALOG[derivedCode].message;
      }
    }

    return { status, code, message };
  }

  private mapQueryFailedError(
    exception: QueryFailedError
  ): CustomException | null {
    const driverError: any = exception.driverError ?? {};
    const errorCode = driverError.code ?? driverError.errno;
    const constraint = String(
      driverError.constraint ?? driverError.index ?? ''
    ).toLowerCase();
    const message = String(
      driverError.sqlMessage ??
        driverError.detail ??
        driverError.message ??
        exception.message ??
        ''
    ).toLowerCase();

    const isDuplicateCode =
      errorCode === 'ER_DUP_ENTRY' || errorCode === 1062 || errorCode === '23505';
    const isPhoneConstraint =
      constraint.includes('phone_hash') || message.includes('phone_hash');

    if (isDuplicateCode && isPhoneConstraint) {
      return new CustomException(
        UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN,
        HttpStatus.BAD_REQUEST
      );
    }

    return null;
  }

  private logException(params: {
    exception: unknown;
    request: Request;
    status: number;
    code: string;
    message: string;
  }) {
    const { exception, request, status, code, message } = params;
    const meta = {
      method: request.method,
      path: request.originalUrl,
      status,
      code,
      message,
      userId: this.resolveUserId(request),
      reqId: request.headers['x-request-id'],
    };

    if (exception instanceof Error) {
      this.logger.error({ ...meta, err: exception, stack: exception.stack }, message);
      return;
    }

    this.logger.error(meta, message);
  }

  private resolveUserId(request: Request): string | undefined {
    const user = request.user as Record<string, unknown> | undefined;
    if (!user) {
      return undefined;
    }

    const keys = ['id', 'userId', 'username', 'sub'];
    for (const key of keys) {
      const value = user[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }

    return undefined;
  }
}
