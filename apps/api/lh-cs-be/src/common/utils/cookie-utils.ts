import { Response } from 'express';

/**
 * CSRF 토큰을 HttpOnly 쿠키로 설정
 * @note: secure: false - 처리 사유: https 설정은 ALB 단에서 이미 잡고있으므로 세션을 처리하기 위해 false 처리.
 */
export function setCsrfTokenCookie(
  response: Response,
  csrfToken: string
): void {
  response.cookie('csrfToken', csrfToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'prd',
    secure: false,
    sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax', // 개발환경에서는 lax
    maxAge: 1000 * 60 * 60 * 24, // 24시간
    path: '/',
  });
}

/**
 * Refresh 토큰을 HttpOnly 쿠키로 설정
 * @note: secure: false - 처리 사유: https 설정은 ALB 단에서 이미 잡고있으므로 세션을 처리하기 위해 false 처리.
 */
export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
  maxAge: number
): void {
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'prd',
    secure: false,
    sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax', // 개발환경에서는 lax
    maxAge,
    path: '/',
  });
}

/**
 * CSRF 토큰 쿠키 삭제
 */
export function clearCsrfTokenCookie(response: Response): void {
  response.clearCookie('csrfToken', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'prd',
    secure: false,
    sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax', // 개발환경에서는 lax
    path: '/',
  });
}

/**
 * Refresh 토큰 쿠키 삭제
 * @note: secure: false - 처리 사유: https 설정은 ALB 단에서 이미 잡고있으므로 세션을 처리하기 위해 false 처리.
 */
export function clearRefreshTokenCookie(response: Response): void {
  response.clearCookie('refreshToken', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'prd',
    secure: false,
    sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax', // 개발환경에서는 lax
    path: '/',
  });
}

/**
 * 모든 인증 관련 쿠키 삭제
 */
export function clearAllAuthCookies(response: Response): void {
  clearCsrfTokenCookie(response);
  clearRefreshTokenCookie(response);
}
