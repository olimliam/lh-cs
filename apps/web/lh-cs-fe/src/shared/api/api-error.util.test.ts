import { describe, expect, it } from 'vitest';
import {
  ApiError,
  extractErrorMessage,
  FALLBACK_API_ERROR_MESSAGE,
} from './api-error.util';

describe('extractErrorMessage', () => {
  it('returns the string payload as-is', () => {
    expect(extractErrorMessage('단일 오류 메시지')).toBe('단일 오류 메시지');
  });

  it('returns the first element when payload is string array', () => {
    expect(extractErrorMessage(['첫 번째 오류', '두 번째 오류'])).toBe('첫 번째 오류');
  });

  it('handles object payload with string message field', () => {
    expect(extractErrorMessage({ message: '오류입니다.' })).toBe('오류입니다.');
  });

  it('handles object payload with string array message field', () => {
    expect(extractErrorMessage({ message: ['배열 오류', '추가 오류'] })).toBe('배열 오류');
  });

  it('handles validation error array payload', () => {
    const payload = [{ constraints: { isNotEmpty: '이 필드는 비어 있을 수 없습니다.' } }];
    expect(extractErrorMessage(payload)).toBe('이 필드는 비어 있을 수 없습니다.');
  });

  it('handles validation error array nested under message field', () => {
    const payload = {
      message: [{ constraints: { maxLength: '10자 이하로 입력해 주세요.' } }],
    };
    expect(extractErrorMessage(payload)).toBe('10자 이하로 입력해 주세요.');
  });

  it('returns fallback message for unknown payload', () => {
    expect(extractErrorMessage({})).toBe(FALLBACK_API_ERROR_MESSAGE);
  });
});

describe('ApiError', () => {
  it('keeps status and raw payload', () => {
    const error = new ApiError('메시지', { status: 400, raw: { foo: 'bar' } });
    expect(error.message).toBe('메시지');
    expect(error.status).toBe(400);
    expect(error.raw).toEqual({ foo: 'bar' });
  });
});
