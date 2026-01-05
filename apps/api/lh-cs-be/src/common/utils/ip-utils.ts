import { Request } from 'express';

export const IP_V4_MAPPED_PREFIX = '::ffff:';

export const normalizeIp = (ipAddress?: string | null): string | undefined => {
  if (!ipAddress) {
    return undefined;
  }

  const trimmed = ipAddress.trim();
  if (!trimmed.length) {
    return undefined;
  }

  if (trimmed.startsWith(IP_V4_MAPPED_PREFIX)) {
    return trimmed.replace(IP_V4_MAPPED_PREFIX, '');
  }

  return trimmed;
};

export const resolveClientIp = (request: Request): string | undefined => {
  const forwardedFor = request.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];
  const candidateFromForward = normalizeIp(firstForwarded);

  if (candidateFromForward) {
    return candidateFromForward;
  }

  const candidateFromHeaders = normalizeIp(
    typeof request.headers['x-real-ip'] === 'string'
      ? request.headers['x-real-ip']
      : undefined
  );

  if (candidateFromHeaders) {
    return candidateFromHeaders;
  }

  const candidateFromSocket = normalizeIp(request.socket?.remoteAddress);
  if (candidateFromSocket) {
    return candidateFromSocket;
  }

  return normalizeIp(request.ip);
};
