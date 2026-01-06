import { resolveClientUrl } from '@/shared/lib/url/resolve-client-url';

export const API_PREFIX = '/api';

const trimTrailingSlash = (value?: string) =>
  value ? value.replace(/\/+$/, '') : '';

const resolvedBase = resolveClientUrl(import.meta.env.VITE_BASE_URL, '');
const normalizedBase = trimTrailingSlash(resolvedBase);

export const API_BASE_URL =
  normalizedBase && normalizedBase.endsWith(API_PREFIX)
    ? normalizedBase
    : `${normalizedBase}${API_PREFIX}` || API_PREFIX;

const ABSOLUTE_URL_REGEX = /^(https?:|wss?:|\/\/)/i;

export const normalizeApiPath = (
  path?: string | null
): string | undefined => {
  if (path == null) return path ?? undefined;
  if (ABSOLUTE_URL_REGEX.test(path)) {
    return path;
  }
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  return trimmed.replace(/^\/+/, '');
};
