// 쿠키 유틸리티 함수
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const SESSION_STORAGE_KEY = 'auth-access-token';

type StoredAccessToken = {
  accessToken: string;
  expiresAt?: number;
};

// 현재 세션에서만 유지되는 메모리 저장소
let accessTokenCache: string | null = null;

const decodeAccessTokenExp = (token: string): number | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(atob(payloadPart));
    const exp = payload?.exp;
    if (typeof exp !== 'number') return null;
    // exp는 seconds 기준이므로 ms로 변환
    return exp * 1000;
  } catch (error) {
    console.warn('Failed to decode access token exp:', error);
    return null;
  }
};

const saveSessionAccessToken = (token: string, expiresAt?: number) => {
  try {
    const data: StoredAccessToken = { accessToken: token, expiresAt };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save access token to sessionStorage:', error);
  }
};

const loadSessionAccessToken = (): StoredAccessToken | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAccessToken;
    if (!parsed?.accessToken) return null;
    return parsed;
  } catch (error) {
    console.warn('Failed to load access token from sessionStorage:', error);
    return null;
  }
};

const clearSessionAccessToken = () => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear access token from sessionStorage:', error);
  }
};

// 토큰 저장 관련 유틸리티
export const tokenStorage = {
  getAccessToken: () => accessTokenCache,
  getRefreshToken: () => getCookie('refreshToken'), // 쿠키에서 읽기 (참고용, 실제로는 HttpOnly라 접근 불가)
  getCsrfToken: () => getCookie('csrfToken'), // 서버가 내려주는 CSRF 토큰을 쿠키에서 조회
  setTokens: (
    accessToken: string,
    _refreshToken?: string // 사용하지 않는 파라미터 (서버에서 쿠키로 자동 설정)
  ) => {
    // Access Token을 메모리에 저장
    accessTokenCache = accessToken;

    // 세션 스토리지에도 만료 시간과 함께 저장 (새로고침 복구용)
    const expiresAt = decodeAccessTokenExp(accessToken) || undefined;
    saveSessionAccessToken(accessToken, expiresAt);

    // Refresh Token과 CSRF Token은 모두 서버에서 HttpOnly 쿠키로 자동 관리됨
  },
  clearTokens: () => {
    accessTokenCache = null;
    clearSessionAccessToken();

    // HttpOnly 쿠키들은 서버에서 삭제되므로 클라이언트에서는 별도 처리 불필요
    // 로그아웃 API 호출 시 서버에서 자동으로 clearAllAuthCookies() 호출됨
  },
  bootstrapFromSession: () => {
    const stored = loadSessionAccessToken();
    if (!stored?.accessToken) {
      return null;
    }
    const now = Date.now();
    if (stored.expiresAt && stored.expiresAt <= now) {
      clearSessionAccessToken();
      return null;
    }
    accessTokenCache = stored.accessToken;
    return stored.accessToken;
  },
};
