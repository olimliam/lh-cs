import {
  PasswordValidator,
  PasswordRules,
  PasswordValidationResult,
} from './password-validator.util';

describe('PasswordValidator', () => {
  describe('validate', () => {
    describe('기본 규칙으로 검증', () => {
      it('유효한 비밀번호는 통과해야 함', () => {
        const result = PasswordValidator.validate('ValidPass12#$');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('모든 조건을 만족하는 비밀번호는 통과해야 함', () => {
        const result = PasswordValidator.validate('MySecure123@');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('길이 검증', () => {
      it('8자 미만의 비밀번호는 실패해야 함', () => {
        const result = PasswordValidator.validate('Test1!');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '비밀번호는 최소 8자 이상이어야 합니다.'
        );
      });

      it('정확히 8자의 비밀번호는 통과해야 함', () => {
        const result = PasswordValidator.validate('Test12#$');

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain(
          '비밀번호는 최소 8자 이상이어야 합니다.'
        );
      });

      it('커스텀 최소 길이 규칙이 적용되어야 함', () => {
        const customRules: Partial<PasswordRules> = { minLength: 12 };
        const result = PasswordValidator.validate('Test12#$', customRules);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '비밀번호는 최소 12자 이상이어야 합니다.'
        );
      });
    });

    describe('대문자 검증', () => {
      it('대문자가 없으면 실패해야 함', () => {
        const result = PasswordValidator.validate('test12#$');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '비밀번호에 대문자가 포함되어야 합니다.'
        );
      });

      it('대문자가 포함되면 통과해야 함', () => {
        const result = PasswordValidator.validate('Test12#$');

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain(
          '비밀번호에 대문자가 포함되어야 합니다.'
        );
      });

      it('대문자 요구사항을 비활성화할 수 있어야 함', () => {
        const customRules: Partial<PasswordRules> = { requireUppercase: false };
        const result = PasswordValidator.validate('test12#$', customRules);

        expect(result.errors).not.toContain(
          '비밀번호에 대문자가 포함되어야 합니다.'
        );
      });
    });

    describe('소문자 검증', () => {
      it('소문자가 없으면 실패해야 함', () => {
        const result = PasswordValidator.validate('TEST12#$');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '비밀번호에 소문자가 포함되어야 합니다.'
        );
      });

      it('소문자가 포함되면 통과해야 함', () => {
        const result = PasswordValidator.validate('Test12#$');

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain(
          '비밀번호에 소문자가 포함되어야 합니다.'
        );
      });

      it('소문자 요구사항을 비활성화할 수 있어야 함', () => {
        const customRules: Partial<PasswordRules> = { requireLowercase: false };
        const result = PasswordValidator.validate('TEST12#$', customRules);

        expect(result.errors).not.toContain(
          '비밀번호에 소문자가 포함되어야 합니다.'
        );
      });
    });

    describe('숫자 검증', () => {
      it('숫자가 없으면 실패해야 함', () => {
        const result = PasswordValidator.validate('TestPass!');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('비밀번호에 숫자가 포함되어야 합니다.');
      });

      it('숫자가 포함되면 통과해야 함', () => {
        const result = PasswordValidator.validate('Test12#$');

        expect(result.isValid).toBe(true);
        expect(result.errors).not.toContain(
          '비밀번호에 숫자가 포함되어야 합니다.'
        );
      });

      it('숫자 요구사항을 비활성화할 수 있어야 함', () => {
        const customRules: Partial<PasswordRules> = { requireNumbers: false };
        const result = PasswordValidator.validate('TestPass!', customRules);

        expect(result.errors).not.toContain(
          '비밀번호에 숫자가 포함되어야 합니다.'
        );
      });
    });

    describe('특수문자 검증', () => {
      it('특수문자가 없으면 실패해야 함', () => {
        const result = PasswordValidator.validate('TestPass123');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.'
        );
      });

      it('허용된 특수문자가 포함되면 통과해야 함', () => {
        const specialChars = [
          '!',
          '@',
          '#',
          '$',
          '%',
          '^',
          '&',
          '*',
          '(',
          ')',
          ',',
          '.',
          '?',
          '"',
          ':',
          '{',
          '}',
          '|',
          '<',
          '>',
        ];

        specialChars.forEach((char) => {
          const result = PasswordValidator.validate(`TestPass123${char}`);
          expect(result.errors).not.toContain(
            '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.'
          );
        });
      });

      it('특수문자 요구사항을 비활성화할 수 있어야 함', () => {
        const customRules: Partial<PasswordRules> = {
          requireSpecialChars: false,
        };
        const result = PasswordValidator.validate('TestPass123', customRules);

        expect(result.errors).not.toContain(
          '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.'
        );
      });
    });

    describe('금지된 패턴 검증', () => {
      it('기본 금지 패턴이 포함되면 실패해야 함', () => {
        const forbiddenPasswords = [
          'Password12#$',
          'test123456!',
          'MyQwerty1!',
          'Admin12#$',
        ];

        forbiddenPasswords.forEach((password) => {
          const result = PasswordValidator.validate(password);
          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((error) => error.includes('일반적인 패턴'))
          ).toBe(true);
        });
      });

      it('대소문자 구분 없이 금지 패턴을 검증해야 함', () => {
        const result = PasswordValidator.validate('PASSWORD12#$');

        expect(result.isValid).toBe(false);
        expect(result.errors.some((error) => error.includes('password'))).toBe(
          true
        );
      });

      it('커스텀 금지 패턴을 설정할 수 있어야 함', () => {
        const customRules: Partial<PasswordRules> = {
          forbiddenPatterns: ['company', 'secret'],
        };
        const result = PasswordValidator.validate('MyCompany12#$', customRules);

        expect(result.isValid).toBe(false);
        expect(result.errors.some((error) => error.includes('company'))).toBe(
          true
        );
      });

      it('금지 패턴을 빈 배열로 설정하면 검증하지 않아야 함', () => {
        const customRules: Partial<PasswordRules> = { forbiddenPatterns: [] };
        const result = PasswordValidator.validate('Password12#$', customRules);

        expect(
          result.errors.some((error) => error.includes('일반적인 패턴'))
        ).toBe(false);
      });
    });

    describe('연속된 문자 검증', () => {
      it('3개 이상의 연속된 문자가 있으면 실패해야 함', () => {
        const consecutivePasswords = [
          'TestAbc12#$',
          'Test123Def!',
          'Abc123Test!',
        ];

        consecutivePasswords.forEach((password) => {
          const result = PasswordValidator.validate(password);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            '비밀번호에 3개 이상의 연속된 문자나 숫자가 포함될 수 없습니다.'
          );
        });
      });

      it('3개 이상의 연속된 숫자가 있으면 실패해야 함', () => {
        const consecutivePasswords = [
          'Test123Pass!',
          'Pass456Test!',
          'MyPass789!',
        ];

        consecutivePasswords.forEach((password) => {
          const result = PasswordValidator.validate(password);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            '비밀번호에 3개 이상의 연속된 문자나 숫자가 포함될 수 없습니다.'
          );
        });
      });

      it('연속되지 않는 문자나 숫자는 통과해야 함', () => {
        const result = PasswordValidator.validate('TestPass135!');

        expect(result.errors).not.toContain(
          '비밀번호에 3개 이상의 연속된 문자나 숫자가 포함될 수 없습니다.'
        );
      });
    });

    describe('반복된 문자 검증', () => {
      it('같은 문자가 3번 이상 반복되면 실패해야 함', () => {
        const repeatedPasswords = ['Tesaaa12#$', 'Test111Pass!', 'MyPasssss1!'];

        repeatedPasswords.forEach((password) => {
          const result = PasswordValidator.validate(password);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            '비밀번호에 같은 문자가 3번 이상 연속으로 반복될 수 없습니다.'
          );
        });
      });

      it('같은 문자가 2번까지 반복되는 것은 통과해야 함', () => {
        const result = PasswordValidator.validate('TestPass11!');

        expect(result.errors).not.toContain(
          '비밀번호에 같은 문자가 3번 이상 연속으로 반복될 수 없습니다.'
        );
      });
    });

    describe('복합 검증', () => {
      it('여러 규칙을 위반한 경우 모든 에러가 반환되어야 함', () => {
        const result = PasswordValidator.validate('test');

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
        expect(result.errors).toContain(
          '비밀번호는 최소 8자 이상이어야 합니다.'
        );
        expect(result.errors).toContain(
          '비밀번호에 대문자가 포함되어야 합니다.'
        );
        expect(result.errors).toContain('비밀번호에 숫자가 포함되어야 합니다.');
        expect(result.errors).toContain(
          '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.'
        );
      });

      it('모든 커스텀 규칙을 적용할 수 있어야 함', () => {
        const customRules: PasswordRules = {
          minLength: 6,
          requireUppercase: false,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          forbiddenPatterns: ['test'],
        };

        const result = PasswordValidator.validate('mypass123', customRules);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('getStrengthLevel', () => {
    it('매우 약한 비밀번호는 레벨 1을 반환해야 함', () => {
      const level = PasswordValidator.getStrengthLevel('test');
      expect(level).toBe(1);
    });

    it('기본 요구사항을 만족하는 비밀번호는 레벨 4를 반환해야 함', () => {
      const level = PasswordValidator.getStrengthLevel('TestPass12#$');
      expect(level).toBe(4);
    });

    it('매우 강한 비밀번호는 레벨 5를 반환해야 함', () => {
      const level = PasswordValidator.getStrengthLevel(
        'MyVeryComplexPassword12#$@#'
      );
      expect(level).toBe(5);
    });

    it('길이가 12자 이상인 비밀번호는 추가 점수를 받아야 함', () => {
      const shortLevel = PasswordValidator.getStrengthLevel('TestPass1!');
      const longLevel = PasswordValidator.getStrengthLevel('MyLongTestPass1!');

      expect(longLevel).toBeGreaterThan(shortLevel);
    });

    it('다양한 문자 종류를 포함한 비밀번호는 높은 점수를 받아야 함', () => {
      const simpleLevel = PasswordValidator.getStrengthLevel('testpass123');
      const complexLevel = PasswordValidator.getStrengthLevel('TestPass12#$');

      expect(complexLevel).toBeGreaterThan(simpleLevel);
    });

    it('고유 문자 비율이 높은 비밀번호는 보너스 점수를 받아야 함', () => {
      const repetitiveLevel =
        PasswordValidator.getStrengthLevel('TestTest12#$');
      const uniqueLevel = PasswordValidator.getStrengthLevel('TestPass12#$');

      expect(uniqueLevel).toBeGreaterThanOrEqual(repetitiveLevel);
    });
  });

  describe('getStrengthText', () => {
    it('각 레벨에 대한 올바른 텍스트를 반환해야 함', () => {
      expect(PasswordValidator.getStrengthText(1)).toBe('매우 약함');
      expect(PasswordValidator.getStrengthText(2)).toBe('약함');
      expect(PasswordValidator.getStrengthText(3)).toBe('보통');
      expect(PasswordValidator.getStrengthText(4)).toBe('강함');
      expect(PasswordValidator.getStrengthText(5)).toBe('매우 강함');
    });

    it('범위를 벗어난 값에 대해 안전하게 처리해야 함', () => {
      expect(PasswordValidator.getStrengthText(0)).toBe('매우 약함');
      expect(PasswordValidator.getStrengthText(-1)).toBe('매우 약함');
      expect(PasswordValidator.getStrengthText(10)).toBe('매우 강함');
    });
  });

  describe('edge cases', () => {
    it('빈 문자열은 모든 검증에 실패해야 함', () => {
      const result = PasswordValidator.validate('');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('null이나 undefined는 처리할 수 없어야 함', () => {
      expect(() => PasswordValidator.validate(null as any)).toThrow();
      expect(() => PasswordValidator.validate(undefined as any)).toThrow();
    });

    it('매우 긴 비밀번호도 정상적으로 처리해야 함', () => {
      const longPassword = 'A'.repeat(1000) + 'b1!';
      const result = PasswordValidator.validate(longPassword);

      expect(result.isValid).toBe(false); // 반복된 문자로 인해 실패
      expect(result.errors).toContain(
        '비밀번호에 같은 문자가 3번 이상 연속으로 반복될 수 없습니다.'
      );
    });

    it('유니코드 문자가 포함된 비밀번호를 처리할 수 있어야 함', () => {
      const result = PasswordValidator.validate('테스트Pass12#$');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('이모지가 포함된 비밀번호를 처리할 수 있어야 함', () => {
      const result = PasswordValidator.validate('TestPass12#$😀');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
