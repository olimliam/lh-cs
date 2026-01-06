import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * UTC 시간을 KST(Asia/Seoul)로 변환
 * @param isoString - ISO 8601 형식의 UTC 시간 문자열
 * @param format - dayjs 포맷 문자열 (기본값: 'YYYY-MM-DD HH:mm:ss')
 * @returns KST로 변환된 포맷팅된 시간 문자열
 */
// ✅ KST 시간 포맷 유틸
export const formatToKST = (
  dateString: string | Date | undefined | null,
  format: string = 'HH:mm:ss'
): string => {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).tz('Asia/Seoul').format(format);
  } catch (error) {
    console.error('Failed to format to KST:', error);
    return '-';
  }
};

export const toKST = (dateString: string | Date | undefined | null) => {
  if (!dateString) return null;
  try {
    return dayjs(dateString).tz('Asia/Seoul');
  } catch (error) {
    console.error('Failed to convert to KST:', error);
    return null;
  }
};
