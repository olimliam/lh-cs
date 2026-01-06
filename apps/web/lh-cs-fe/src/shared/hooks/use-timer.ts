import { useEffect, useState, useRef, useMemo } from 'react';

interface UseTimerProps {
  startTime?: Date | string;
}

interface UseTimerReturn {
  formattedTime: string;
  totalSeconds: number;
}

/**
 * 범용 타이머 훅
 * startTime부터 현재까지의 경과 시간을 1초마다 업데이트합니다.
 */
export const useTimer = ({
  startTime,
}: UseTimerProps): UseTimerReturn => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!startTime) {
      setTotalSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const baseTime = new Date(startTime);

    // 즉시 한 번 실행하여 초기값 설정
    const calculateElapsedTime = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - baseTime.getTime();
      const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
      setTotalSeconds(elapsedSeconds);
      return elapsedSeconds;
    };

    // 초기값 설정
    calculateElapsedTime();

    // 1초마다 업데이트하는 타이머 시작
    intervalRef.current = setInterval(() => {
      calculateElapsedTime();
    }, 1000);

    // 정리 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime]);

  // 시간 포맷팅 (HH시간 mm분 ss초)
  const formattedTime = useMemo(() => {
    if (totalSeconds === 0) {
      return '00시간 00분 00초';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}시간 ${minutes.toString().padStart(2, '0')}분 ${seconds.toString().padStart(2, '0')}초`;
  }, [totalSeconds]);

  return {
    formattedTime,
    totalSeconds,
  };
};