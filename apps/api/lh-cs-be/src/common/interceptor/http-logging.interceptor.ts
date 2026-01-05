import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);
  constructor(private readonly clsService: ClsService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl } = request;

    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startedAt;
        const traceId = this.clsService.get<string>('traceId');
        this.logger.log(
          this.composeMessage(
            method,
            originalUrl,
            response.statusCode,
            elapsed,
            traceId,
            request
          )
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  private composeMessage(
    method: string,
    url: string,
    statusCode: number,
    elapsed: number,
    traceId: string | undefined,
    request: Request
  ): string {
    const userToken = this.resolveUserToken(request);
    const query = this.stringifyQuery(request);

    return [
      `[HTTP] ${method} ${url}`,
      `status=${statusCode}`,
      `duration=${elapsed}ms`,
      traceId ? `traceId=${traceId}` : null,
      userToken ? `user=${userToken}` : null,
      query ? `query=${query}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private resolveUserToken(request: Request): string | undefined {
    const user: Record<string, unknown> | undefined = request.user as
      | Record<string, unknown>
      | undefined;

    if (!user) {
      return undefined;
    }

    const candidateKeys = ['id', 'userId', 'email', 'sub'];

    for (const key of candidateKeys) {
      const value = user[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }

    return undefined;
  }

  private stringifyQuery(request: Request): string | undefined {
    if (!request.query || Object.keys(request.query).length === 0) {
      return undefined;
    }

    try {
      return JSON.stringify(request.query);
    } catch (error) {
      this.logger.warn('[HTTP] Failed to stringify query params');
      return undefined;
    }
  }
}
