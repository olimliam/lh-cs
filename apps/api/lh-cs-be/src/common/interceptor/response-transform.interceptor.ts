import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse } from '@/common/dto/common-response.dto';
import {
  API_ERROR_CATALOG,
  ApiErrorCode,
  DEFAULT_SUCCESS_CODE,
} from '@/common/exception/error';
import {
  ResponsePayload,
  isResponsePayload,
} from '@/common/dto/response-payload.dto';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(map((value) => this.wrapResponse(value)));
  }

  private wrapResponse(original: unknown) {
    if (this.isAlreadyCommonResponse(original)) {
      return original;
    }

    const payload = this.normalizePayload(original);
    const code = payload.code ?? DEFAULT_SUCCESS_CODE;
    const catalogEntry =
      API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_SUCCESS_CODE];
    const message = payload.message ?? catalogEntry.message;
    const data = Object.prototype.hasOwnProperty.call(payload, 'data')
      ? payload.data
      : (original ?? null);

    return CommonResponse.success(
      data,
      catalogEntry.code as ApiErrorCode,
      message
    );
  }

  private normalizePayload(value: unknown): ResponsePayload {
    if (isResponsePayload(value)) {
      return value;
    }

    return { data: value };
  }

  private isAlreadyCommonResponse(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      Object.prototype.hasOwnProperty.call(candidate, 'success') &&
      Object.prototype.hasOwnProperty.call(candidate, 'code') &&
      Object.prototype.hasOwnProperty.call(candidate, 'message')
    );
  }
}
