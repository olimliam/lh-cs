import { Logger, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { Request } from 'express';
import { ResponseTransformInterceptor } from '@/common/interceptor/response-transform.interceptor';
import { GlobalExceptionFilter } from '@/common/exception/filter/global-exception.filter';
import {
  getTraceIdHeader,
  resolveRequestId,
} from '@/common/utils/request-id.util';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (req) => resolveRequestId(req as Request),
        transport:
          process.env.USE_PINO_PRETTY === 'true' &&
          process.env.NODE_ENV !== 'production' &&
          process.env.NODE_ENV !== 'prd'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          remove: true,
        },
        serializers: {
          req(req: Request) {
            return {
              method: req.method,
              url: req.originalUrl ?? req.url,
              remoteAddress: req.socket?.remoteAddress,
              userAgent: req.headers['user-agent'],
              contentLength: req.headers['content-length'],
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
              responseTime: (res as any).responseTime,
            };
          },
          err: (err: Error) => ({
            type: err.name,
            message: err.message,
            stack: err.stack,
          }),
        },
        customProps: (req) => {
          const request = req as Request & { id?: string };
          return {
            app: 'lh-cs-be',
            env: process.env.NODE_ENV ?? 'local',
            reqId: request.id,
            traceId: getTraceIdHeader(request) ?? request.id,
            userId: resolveUserId(request),
          };
        },
        customSuccessMessage: (req, res) =>
          `${req.method} ${req.url} ${res.statusCode}`,
        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} ${
            err?.message ?? 'error'
          }`,
      },
    }),
  ],
  providers: [
    Logger,
    ResponseTransformInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [PinoLoggerModule, Logger],
})
export class LoggerModule {}

function resolveUserId(request: Request): string | undefined {
  const user = request.user as Record<string, unknown> | undefined;
  if (!user) {
    return undefined;
  }

  const candidateKeys = ['id', 'userId', 'username', 'sub'];
  for (const key of candidateKeys) {
    const value = user[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}
