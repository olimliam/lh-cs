import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
    } else {
      // TODO 아직 이해도가 떨어져서 이렇게 처리하는데 특정 에러에 대한 handling을 처리할 수 있는 방법을 찾아봐야 될 듯
      response
        .status(exception?.response.status)
        .json(exception?.response?.data);
    }
  }
}
