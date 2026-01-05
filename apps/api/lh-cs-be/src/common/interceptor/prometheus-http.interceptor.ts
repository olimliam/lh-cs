import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { Request } from 'express';
import { Observable, catchError, tap } from 'rxjs';

@Injectable()
export class PrometheusHttpInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<'method' | 'path' | 'status'>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse();

    const path =
      (req.route?.path as string) ??
      ((req.baseUrl || req.originalUrl || req.url || '').split('?')[0] ||
        'unknown');
    const method = req.method;

    const end = this.httpRequestDuration.startTimer({
      method,
      path,
    });

    return next.handle().pipe(
      tap(() => {
        end({ status: String(res.statusCode ?? 0) });
      }),
      catchError((err) => {
        const status =
          typeof err?.status === 'number'
            ? err.status
            : typeof res.statusCode === 'number'
              ? res.statusCode
              : 500;
        end({ status: String(status) });
        throw err;
      })
    );
  }
}
