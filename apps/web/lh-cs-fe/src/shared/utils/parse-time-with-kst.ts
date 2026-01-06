import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 서버 환경 캐시 (API 첫 응답 시 한 번만 감지)
let cachedServerEnv: 'UTC' | 'KST' | null = null;

/**
 * 서버의 실제 시간대를 판단하는 함수
 *
 * 핵심 아이디어:
 * - Dev/Local (AWS): 항상 UTC 시간 반환 (예: 2025-12-02T09:04:53.000Z = UTC 09:04)
 * - PRD (Naver Cloud): KST 시간을 UTC로 거짓 표기 (예: 2025-12-02T18:04:53.000Z인데 실제 의미는 KST 18:04)
 *
 * 방법: 서버 시간을 두 가지로 파싱해서 비교
 * 1. Z를 그대로 두고 UTC로 파싱 → t1
 * 2. Z를 제거하고 로컬 시간으로 파싱 → t2
 *
 * - 만약 t2가 현재 시간과 가깝다 → KST (PRD, Z가 거짓)
 * - 만약 t1이 현재 UTC 시간과 가깝다 → UTC (Dev, Z가 정상)
 *
 * @param serverTime - 서버에서 받은 시간 문자열
 * @returns 'UTC' if Dev/Local, 'KST' if PRD
 */
export const detectServerTimezone = (serverTime: string): 'UTC' | 'KST' => {
  if (cachedServerEnv) return cachedServerEnv;

  if (!serverTime || typeof serverTime !== 'string') return 'UTC';

  try {
    // 현재 시간 (브라우저의 로컬 시간)
    const nowLocal = dayjs();

    // 현재 시간을 UTC로 변환 (참고용)
    const nowUTC = dayjs.utc();

    // 파싱 1: Z 마커 그대로 → UTC로 해석
    const serverAsUTC = dayjs(serverTime);

    // 파싱 2: Z 마커 제거 → 로컬 시간으로 해석
    const cleanTimestamp = serverTime.replace('Z', '');
    const serverAsLocal = dayjs(cleanTimestamp, 'YYYY-MM-DDTHH:mm:ss.SSS');

    // 현재 시간과의 차이 계산 (분 단위)
    const diffFromLocalParsing = Math.abs(
      nowLocal.diff(serverAsLocal, 'minute')
    );
    const diffFromUTCParsing = Math.abs(nowUTC.diff(serverAsUTC, 'minute'));

    // 판단 로직: 어느 것이 현재 시간과 더 가깝나?
    if (diffFromLocalParsing < diffFromUTCParsing) {
      // Z를 제거해서 파싱한 것이 현재 시간과 가까움 → PRD (KST)
      // 즉, 서버가 KST 값에 Z 마커를 거짓으로 붙인 것
      cachedServerEnv = 'KST';

      return 'KST';
    } else {
      // Z를 그대로 두고 파싱한 것이 현재 시간과 가까움 → Dev (UTC)
      // 즉, 서버가 올바른 UTC 값을 보낸 것
      cachedServerEnv = 'UTC';

      return 'UTC';
    }
  } catch (error) {
    console.error('Error detecting server timezone:', error);
    return 'UTC';
  }
};

export const parseTimeWithKST = (timestamp: string | Date): Date => {
  if (!timestamp) return new Date();

  if (typeof timestamp === 'string') {
    // 서버 시간대 감지
    const serverEnv = detectServerTimezone(timestamp);

    if (serverEnv === 'KST') {
      // PRD: Z 마커 제거 후 로컬(KST) 시간으로 파싱
      // 예: "2025-12-02T18:04:53.000Z" → "2025-12-02T18:04:53.000"
      // → 브라우저가 KST이므로 로컬 시간으로 해석됨
      const cleanTimestamp = timestamp.replace('Z', '');
      return dayjs(cleanTimestamp, 'YYYY-MM-DDTHH:mm:ss.SSS').toDate();
    } else {
      // Dev/Local: Z 마커 그대로 두고 UTC로 파싱 (정상)
      // 예: "2025-12-02T09:04:53.000Z" → UTC 기준
      return new Date(timestamp);
    }
  }

  return new Date(timestamp);
};
