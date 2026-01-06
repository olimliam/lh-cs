const ABSOLUTE_URL_REGEX = /^(https?:\/\/|wss?:\/\/)/i;

const ensureLeadingSlash = (value: string) => {
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
};

export const resolveClientUrl = (
  rawValue: string | undefined | null,
  fallback: string = ''
): string => {
  const source = (rawValue ?? fallback).trim();
  if (!source) return '';
  if (ABSOLUTE_URL_REGEX.test(source)) {
    return source;
  }

  const normalized = ensureLeadingSlash(source);

  if (typeof window === 'undefined' || !window.location?.origin) {
    return normalized;
  }

  return `${window.location.origin}${normalized}`;
};
