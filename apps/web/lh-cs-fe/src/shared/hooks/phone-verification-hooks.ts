export const normalizePhoneNumber = (value: string) => {
  // 숫자만 남기고 010-1234-5678 형태로 포맷팅
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7)
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};
