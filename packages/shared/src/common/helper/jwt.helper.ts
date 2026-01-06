export const calculateMaxAge = (expiresIn: string | number): number => {
  const timeUnit = typeof expiresIn === 'string' ? expiresIn.slice(-1) : 's'; // 마지막 문자가 단위 ('s', 'm', 'h', 'd', 'w', 'y')
  const timeValue =
    typeof expiresIn === 'string'
      ? parseInt(expiresIn.slice(0, -1))
      : expiresIn; // 숫자 부분만 추출

  switch (timeUnit) {
    case 's': // 초
      return timeValue * 1000; // 초를 밀리초로 변환
    case 'm': // 분
      return timeValue * 60 * 1000; // 분을 밀리초로 변환
    case 'h': // 시간
      return timeValue * 60 * 60 * 1000; // 시간을 밀리초로 변환
    case 'd': // 일
      return timeValue * 24 * 60 * 60 * 1000; // 일을 밀리초로 변환
    case 'w': // 주
      return timeValue * 7 * 24 * 60 * 60 * 1000; // 주를 밀리초로 변환
    case 'y': // 년
      return timeValue * 365 * 24 * 60 * 60 * 1000; // 년을 밀리초로 변환 (윤년 고려하지 않음)
    default:
      throw new Error('Unsupported expiresIn format');
  }
};
