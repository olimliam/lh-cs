import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { TypeORMErrorCodes } from '../error-code/typeorm-error.code';

@Catch()
export class TypeORMExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (
      exception?.code &&
      exception?.sqlMessage &&
      Object.keys(TypeORMErrorCodes).includes(
        exception.code as keyof typeof TypeORMErrorCodes
      )
    ) {
      const status = exception?.sqlMessage
        ? HttpStatus.UNPROCESSABLE_ENTITY
        : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        status,
        code: exception.code,
        message:
          TypeORMErrorCodes[exception.code as keyof typeof TypeORMErrorCodes],
      });
    }
  }
}
