/**
 * 파일 UUID 생성
 * crypto.getRandomValues()를 사용하여 암호학적으로 안전한 난수 생성
 */
export const generateFileUuid = (): string => {
  const array = new Uint8Array(7);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .substring(0, 9);
};
