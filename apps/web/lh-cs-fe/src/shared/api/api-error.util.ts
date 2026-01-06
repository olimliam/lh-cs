import { AxiosError } from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly raw: unknown;

  constructor(message: string, options: { status?: number; raw?: unknown } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.raw = options.raw;
  }
}

export const FALLBACK_API_ERROR_MESSAGE =
  '일시적인 오류가 발생했습니다. 관리자에게 문의해 주세요.';

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isValidationErrorArray = (
  value: unknown
): value is Array<{ constraints?: Record<string, string> }> => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const constraints = (item as Record<string, unknown>).constraints;
      if (!constraints || typeof constraints !== 'object') {
        return false;
      }

      return Object.values(constraints).some(
        (constraint): constraint is string => typeof constraint === 'string'
      );
    }
    return false;
  });
};

export const extractErrorMessage = (payload: unknown): string => {
  if (!payload) {
    return FALLBACK_API_ERROR_MESSAGE;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (isStringArray(payload)) {
    return payload[0] ?? FALLBACK_API_ERROR_MESSAGE;
  }

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    const maybeMessage = (payload as Record<string, unknown>).message;
    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }
    if (isStringArray(maybeMessage)) {
      return maybeMessage[0] ?? FALLBACK_API_ERROR_MESSAGE;
    }
    if (isValidationErrorArray(maybeMessage)) {
      const [firstError] = maybeMessage;
      if (firstError?.constraints) {
        const firstConstraint = Object.values(firstError.constraints).find(
          (value): value is string => typeof value === 'string'
        );
        if (firstConstraint) {
          return firstConstraint;
        }
      }
    }
  }

  if (isValidationErrorArray(payload)) {
    const [firstError] = payload;
    if (firstError?.constraints) {
      const firstConstraint = Object.values(firstError.constraints).find(
        (value): value is string => typeof value === 'string'
      );
      if (firstConstraint) {
        return firstConstraint;
      }
    }
  }

  return FALLBACK_API_ERROR_MESSAGE;
};

export const isAxiosError = (error: unknown): error is AxiosError => {
  return !!error && typeof error === 'object' && (error as AxiosError).isAxiosError === true;
};
