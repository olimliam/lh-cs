import { TransformFnParams } from 'class-transformer';

export const transformToStringArray = ({
  value,
}: TransformFnParams): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? '' : String(item)))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            item === undefined || item === null ? '' : String(item).trim()
          )
          .filter((item) => item.length > 0);
      }
    } catch (error) {
      // 시큐어 코딩: JSON 파싱 실패 시 콤마 구분자로 fallback 처리
      console.debug('[transformToStringArray] JSON 파싱 실패, 콤마 구분자로 처리:', error);
    }

    return trimmed
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);
  }

  return [String(value)];
};
