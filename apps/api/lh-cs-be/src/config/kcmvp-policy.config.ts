/**
 * KCMVP 기준 암호화 정책 설정
 *
 * 공공기관 보안 요구사항에 따라 서버에서 강제되는 암호화 정책
 * 클라이언트에서 변경할 수 없는 고정 설정
 */

export const KCMVP_PASSWORD_POLICY = {
  // 주 알고리즘 (KCMVP 검증 모듈 기준)
  kdfAlgorithm: 'pbkdf2-hmac-sha256',

  // 대체 알고리즘 (기관 정책에 따라 선택)
  fallbackAlgorithm: 'pbkdf2-hmac-sha512',

  // PBKDF2 파라미터 (NIST SP 800-132 기준)
  pbkdf2: {
    iterations: 310000, // OWASP 2023 권장 최소값
    keyLength: 64, // 512비트
    digest: 'sha256', // 기본 해시 함수
  },

  // Salt 정책
  salt: {
    length: 32, // 256비트
    encoding: 'hex',
  },

  // Pepper 정책 (HSM 관리)
  pepper: {
    version: 1, // 현재 사용 버전
    rotation: '1year', // 회전 주기
  },

  // 보안 정책 업데이트 기준
  security: {
    minIterations: 100000, // 최소 반복 횟수
    recommendedIterations: 310000, // 권장 반복 횟수
    maxPasswordAge: '1year', // 비밀번호 최대 수명
    forceUpgradeThreshold: 100000, // 강제 업그레이드 기준
  },

  // 감사 및 로깅
  audit: {
    logPasswordChanges: true,
    logHashUpgrades: true,
    logSecurityEvents: true,
  },
} as const;

/**
 * 현재 활성 정책 반환
 */
export function getCurrentPasswordPolicy() {
  return KCMVP_PASSWORD_POLICY;
}

/**
 * 정책 버전 정보
 */
export const POLICY_VERSION = '1.0.0';
export const POLICY_EFFECTIVE_DATE = '2025-09-23';
export const COMPLIANCE_STANDARDS = [
  'KCMVP',
  'KISA 암호이용실무가이드',
  '개인정보보호법',
  'NIST SP 800-132',
  'OWASP ASVS 4.0',
];
