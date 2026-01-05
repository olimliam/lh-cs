import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  PasswordValidator,
  PasswordRules,
} from '../utils/password-validator.util';

export interface StrongPasswordOptions extends Partial<PasswordRules> {
  message?: string;
}

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments): boolean {
    const [options] = args.constraints;
    const result = PasswordValidator.validate(password, options);

    // 에러 메시지를 constraint에 저장해서 defaultMessage에서 사용
    (args.object as any).__passwordErrors = result.errors;

    return result.isValid;
  }

  defaultMessage(args: ValidationArguments): string {
    const errors = (args.object as any).__passwordErrors || [];

    if (errors.length === 0) {
      return '비밀번호가 보안 정책을 만족하지 않습니다.';
    }

    // 첫 번째 에러만 반환 (API 응답에서 모든 에러를 보려면 서비스 레이어에서 처리)
    return errors[0];
  }
}

export function IsStrongPassword(
  options: StrongPasswordOptions = {},
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsStrongPasswordConstraint,
    });
  };
}
