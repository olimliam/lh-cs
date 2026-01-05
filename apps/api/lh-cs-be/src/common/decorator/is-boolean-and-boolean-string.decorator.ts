// is-boolean-and-boolean-string.decorator.ts
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

type BoolStringOptions = {
  /** 값이 없을 때( undefined | null | '' ) 필드를 스킵할지 */
  skipIfEmpty?: boolean; // default: true
  /** "1"/"0", "on"/"off" 같은 확장 표기 허용 여부 */
  acceptExtendedLiterals?: boolean; // default: false
  /** DTO 필드를 optional 취급할지 (IsOptional 추가) */
  optional?: boolean; // default: false
};

export function IsBooleanAndBooleanString(
  opts: BoolStringOptions = {}
): PropertyDecorator {
  const {
    skipIfEmpty = true,
    acceptExtendedLiterals = false,
    optional = false,
  } = opts;

  const transformer = Transform(({ value }) => {
    // 비어있는 값 처리는 가장 먼저
    if (
      skipIfEmpty &&
      (value === undefined || value === null || value === '')
    ) {
      return undefined; // -> IsOptional이 있으면 검증 스킵됨
    }

    // 이미 boolean 이면 그대로
    if (typeof value === 'boolean') return value;

    // 문자열 → boolean
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true') return true;
      if (v === 'false') return false;

      if (acceptExtendedLiterals) {
        if (v === '1' || v === 'on' || v === 'yes') return true;
        if (v === '0' || v === 'off' || v === 'no') return false;
      }
    }

    // 숫자(폼 파서에 따라 숫자로 올 수도 있음)
    if (acceptExtendedLiterals && typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    // 그 외는 그대로 두고 IsBoolean에서 걸러지게
    return value;
  });

  // 데코레이터 합성
  const decos: (PropertyDecorator | MethodDecorator)[] = [
    transformer,
    IsBoolean(),
  ];
  if (optional) decos.unshift(IsOptional());

  return applyDecorators(...(decos as PropertyDecorator[]));
}
