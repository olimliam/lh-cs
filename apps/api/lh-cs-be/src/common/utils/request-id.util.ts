import { randomUUID } from 'crypto';
import type { Request } from 'express';

const REQUEST_ID_STATEMENT = Symbol('REQUEST_ID');

export const REQUEST_ID_HEADER = 'x-request-id';
export const TRACE_ID_HEADER = 'x-b3-traceid';

export function resolveRequestId(req: Request): string {
  const existing = getStoredRequestId(req);
  if (existing) {
    return existing;
  }

  const headerId =
    normalizeHeader(req.headers[REQUEST_ID_HEADER]) ??
    normalizeHeader(req.headers[TRACE_ID_HEADER]);

  const requestId = headerId ?? randomUUID();
  storeRequestId(req, requestId);
  return requestId;
}

export function mayResolveRequestId(req: Request): string | undefined {
  return getStoredRequestId(req);
}

export function storeRequestId(req: Request, requestId: string): void {
  (req as Request & { [REQUEST_ID_STATEMENT]?: string })[
    REQUEST_ID_STATEMENT
  ] = requestId;
}

export function getTraceIdHeader(req: Request): string | undefined {
  return (
    normalizeHeader(req.headers[TRACE_ID_HEADER]) ??
    normalizeHeader(req.headers[REQUEST_ID_HEADER])
  );
}

function getStoredRequestId(req: Request): string | undefined {
  return (req as Request & { [REQUEST_ID_STATEMENT]?: string })[
    REQUEST_ID_STATEMENT
  ];
}

function normalizeHeader(value: string | string[] | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeHeader(item);
      if (normalized) {
        return normalized;
      }
    }
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}
