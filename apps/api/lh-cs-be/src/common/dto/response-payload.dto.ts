import { ApiErrorCode } from '@/common/exception/error';

export interface ResponsePayload<T = unknown> {
  data?: T;
  code?: ApiErrorCode;
  message?: string;
}

export const isResponsePayload = <T = unknown>(
  value: unknown
): value is ResponsePayload<T> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ResponsePayload<T>>;

  return (
    Object.prototype.hasOwnProperty.call(candidate, 'data') ||
    Object.prototype.hasOwnProperty.call(candidate, 'code') ||
    Object.prototype.hasOwnProperty.call(candidate, 'message')
  );
};
