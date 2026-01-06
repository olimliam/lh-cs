const WS_REGEX = /^wss?:\/\//i;
const HTTP_REGEX = /^https?:\/\//i;

const ensureLeadingSlash = (value: string) => {
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
};

const buildDefaultWsOrigin = () => {
  if (typeof window === 'undefined' || !window.location?.host) {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return `${protocol}${window.location.host}`;
};

export const resolveWebSocketUrl = (
  rawValue: string | undefined | null,
  fallbackPath = '/api/ws'
): string => {
  const source = rawValue?.trim();
  const base = source && source.length > 0 ? source : fallbackPath;
  const candidate = base.trim();
  if (!candidate) return '';

  if (WS_REGEX.test(candidate)) {
    return candidate;
  }

  if (HTTP_REGEX.test(candidate)) {
    return candidate
      .replace(/^https:\/\//i, 'wss://')
      .replace(/^http:\/\//i, 'ws://');
  }

  const normalizedPath = ensureLeadingSlash(candidate);
  const origin = buildDefaultWsOrigin();
  if (!origin) {
    return normalizedPath;
  }

  return `${origin}${normalizedPath}`;
};
