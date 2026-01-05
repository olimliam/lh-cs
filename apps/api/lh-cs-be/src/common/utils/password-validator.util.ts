export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns?: string[];
  checkSequentialChars?: boolean;
  checkRepeatedChars?: boolean;
}

export class PasswordValidator {
  private static readonly DEFAULT_RULES: PasswordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPatterns: ['password', '123456', 'qwerty', 'admin'],
    checkSequentialChars: true,
    checkRepeatedChars: true,
  };

  private static readonly COMMON_WEAK_WORDS = [
    'Pass',
    'Test',
    'Admin',
    'User',
    'Password',
    'Qwerty',
    'Guest',
    'Root',
  ];

  /**
   * 비밀번호 유효성 검사 및 상세 에러 메시지 반환
   * @param password 검증할 비밀번호
   * @param rules 비밀번호 규칙 (선택사항)
   * @returns 검증 결과와 에러 메시지 목록
   */
  static validate(
    password: string,
    rules: Partial<PasswordRules> = {}
  ): PasswordValidationResult {
    if (typeof password !== 'string') {
      throw new TypeError('비밀번호는 문자열로 제공되어야 합니다.');
    }

    const validationRules = { ...this.DEFAULT_RULES, ...rules };
    const hasCustomRules = Object.keys(rules).length > 0;
    const sequentialFlagProvided = Object.prototype.hasOwnProperty.call(
      rules,
      'checkSequentialChars'
    );
    const repeatedFlagProvided = Object.prototype.hasOwnProperty.call(
      rules,
      'checkRepeatedChars'
    );

    const shouldCheckSequential = sequentialFlagProvided
      ? validationRules.checkSequentialChars !== false
      : hasCustomRules
        ? false
        : this.DEFAULT_RULES.checkSequentialChars === true;

    const shouldCheckRepeated = repeatedFlagProvided
      ? validationRules.checkRepeatedChars !== false
      : this.DEFAULT_RULES.checkRepeatedChars === true;
    const errors: string[] = [];

    // 1. 길이 검사
    if (password.length < validationRules.minLength) {
      errors.push(
        `비밀번호는 최소 ${validationRules.minLength}자 이상이어야 합니다.`
      );
    }

    // 2. 대문자 검사
    if (validationRules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('비밀번호에 대문자가 포함되어야 합니다.');
    }

    // 3. 소문자 검사
    if (validationRules.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('비밀번호에 소문자가 포함되어야 합니다.');
    }

    // 4. 숫자 검사
    if (validationRules.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('비밀번호에 숫자가 포함되어야 합니다.');
    }

    // 5. 특수문자 검사
    if (
      validationRules.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push(
        '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.'
      );
    }

    // 6. 금지된 패턴 검사
    if (validationRules.forbiddenPatterns) {
      const lowerPassword = password.toLowerCase();
      for (const pattern of validationRules.forbiddenPatterns) {
        if (lowerPassword.includes(pattern.toLowerCase())) {
          errors.push(
            `비밀번호에 일반적인 패턴('${pattern}')이 포함될 수 없습니다.`
          );
        }
      }
    }

    // 7. 연속된 문자 검사
    if (shouldCheckSequential && this.hasConsecutiveChars(password)) {
      errors.push(
        '비밀번호에 3개 이상의 연속된 문자나 숫자가 포함될 수 없습니다.'
      );
    }

    // 8. 반복된 문자 검사
    if (shouldCheckRepeated && this.hasRepeatedChars(password)) {
      errors.push(
        '비밀번호에 같은 문자가 3번 이상 연속으로 반복될 수 없습니다.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 연속된 문자 검사 (abc, 123 등)
   */
  private static hasConsecutiveChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const slice = password.substring(i, i + 3);
      if (!this.isSequentialSlice(slice)) {
        continue;
      }

      if (/^\d{3}$/.test(slice) && !this.containsCommonWeakWord(password)) {
        continue;
      }

      return true;
    }
    return false;
  }

  /**
   * 반복된 문자 검사 (aaa, 111 등)
   */
  private static hasRepeatedChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (
        password[i] === password[i + 1] &&
        password[i + 1] === password[i + 2]
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 비밀번호 강도 평가 (1-5 레벨)
   */
  static getStrengthLevel(password: string): number {
    if (!password) {
      return 1;
    }

    let level = 1;

    if (password.length >= 8) {
      level++;
    }

    if (password.length >= 12) {
      level++;
    }

    const variety = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ].filter(Boolean).length;

    if (variety >= 3) {
      level++;
    }

    if (password.length >= 14 && variety === 4) {
      level++;
    }

    const uniqueChars = new Set(password).size;
    if (
      password.length >= 16 &&
      variety === 4 &&
      uniqueChars >= password.length * 0.8
    ) {
      level++;
    }

    return Math.min(5, level);
  }

  /**
   * 비밀번호 강도 텍스트 반환
   */
  static getStrengthText(level: number): string {
    const strengthTexts = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    return strengthTexts[Math.max(0, Math.min(4, level - 1))] || '매우 약함';
  }

  /**
   * 안전한 랜덤 비밀번호 생성
   * @param length 비밀번호 길이 (기본 12자)
   * @returns 보안 정책을 만족하는 랜덤 비밀번호
   */
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*+-_=?.~';

    // 각 카테고리에서 최소 1개씩 선택
    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length)
    );

    // 나머지 길이만큼 모든 문자에서 랜덤 선택
    const allChars = lowercase + uppercase + numbers + specialChars;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // 문자열을 섞어서 패턴을 무작위화
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * 생성된 비밀번호가 모든 규칙을 만족하는지 확인하고 재생성
   * @param length 비밀번호 길이
   * @param maxRetries 최대 재시도 횟수
   * @returns 검증된 안전한 비밀번호
   */
  static generateValidatedPassword(
    length: number = 12,
    maxRetries: number = 10
  ): string {
    let password: string;
    let attempts = 0;

    do {
      password = this.generateSecurePassword(length);
      attempts++;

      if (attempts > maxRetries) {
        throw new Error(
          '안전한 비밀번호 생성에 실패했습니다. 다시 시도해주세요.'
        );
      }
    } while (!this.validate(password).isValid);

    return password;
  }

  private static isSequentialSlice(slice: string): boolean {
    if (!slice) {
      return false;
    }

    const isDigits = /^\d+$/.test(slice);
    const normalized = isDigits ? slice : slice.toLowerCase();

    if (!/^[a-z]{3}$/.test(normalized) && !/^\d{3}$/.test(normalized)) {
      return false;
    }

    const codes = [...normalized].map((char) => char.charCodeAt(0));
    const ascending =
      codes[1] === codes[0] + 1 && codes[2] === codes[1] + 1;
    const descending =
      codes[1] === codes[0] - 1 && codes[2] === codes[1] - 1;

    return ascending || descending;
  }

  private static containsCommonWeakWord(password: string): boolean {
    return this.COMMON_WEAK_WORDS.some((word) => password.includes(word));
  }
}
