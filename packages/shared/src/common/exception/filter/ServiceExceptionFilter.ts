import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ServiceException } from '../service.exception';

// src/common/exception-filter/service.exception.to.http.exception.filter.ts
@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception.errorCode.status;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      path: request.url,
    });
  }
}
