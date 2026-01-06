import { useEffect, useState, useRef, useMemo } from 'react';
import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';
import {
  parseTimeWithKST,
  detectServerTimezone,
} from '../utils/parse-time-with-kst';

interface UseConsultationTimerProps {
  consultationId: string;
  consultingStartedAt?: string | Date;
  isConsulting: boolean;
  createdAt?: string | Date;
  status?: ConsultationStatusEnum;
}

interface UseConsultationTimerReturn {
  formattedTime: string;
  totalSeconds: number;
}

// React 기반 타이머 훅 - 각 컴포넌트에서 독립적으로 사용

/**
 * 상담 시간 카운터 훅 (React 기반)
 * 각 ConsultationCard 컴포넌트에서 독립적으로 1초마다 시간을 업데이트합니다.
 */
export const useConsultationTimer = ({
  consultationId,
  consultingStartedAt,
  isConsulting,
  createdAt,
  status,
}: UseConsultationTimerProps): UseConsultationTimerReturn => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 타이머가 필요한 상태인지 확인
    const needsTimer =
      status === ConsultationStatusEnum.READY ||
      status === ConsultationStatusEnum.CONSULTING ||
      status === ConsultationStatusEnum.END;

    if (!needsTimer) {
      console.log('ver3. No timer needed for status =========>', status);
      setTotalSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 각 상태에 따른 기준 시간 결정
    let baseTime: Date | null = null;

    if (status === ConsultationStatusEnum.READY && createdAt) {
      console.log(
        'ver3. ConsultationStatusEnum.READY && createdAt',
        status,
        createdAt
      );
      // READY 상태: createdAt부터 시간 계산
      const serverEnv =
        typeof createdAt === 'string' ? detectServerTimezone(createdAt) : 'UTC';
      console.log(`ver3. 🌍 Server Environment: ${serverEnv}`);
      baseTime = parseTimeWithKST(createdAt);
      console.log('ver3. create baseTime for READY status:', baseTime);
    } else if (
      status === ConsultationStatusEnum.CONSULTING &&
      consultingStartedAt
    ) {
      console.log(
        'ver3. ConsultationStatusEnum.CONSULTING && consultingStartedAt',
        status,
        consultingStartedAt
      );
      // CONSULTING 상태: consultingStartedAt부터 시간 계산
      const serverEnv =
        typeof consultingStartedAt === 'string'
          ? detectServerTimezone(consultingStartedAt)
          : 'UTC';
      console.log(`ver3. 🌍 Server Environment: ${serverEnv}`);
      baseTime = parseTimeWithKST(consultingStartedAt);
      console.log('ver3. create baseTime for CONSULTING status:', baseTime);
    } else if (status === ConsultationStatusEnum.END && consultingStartedAt) {
      console.log(
        'ver3. ConsultationStatusEnum.END && consultingStartedAt',
        status,
        consultingStartedAt
      );
      // END 상태: consultingStartedAt부터 시간 계산 (종료 시간까지의 총 상담 시간)
      const serverEnv =
        typeof consultingStartedAt === 'string'
          ? detectServerTimezone(consultingStartedAt)
          : 'UTC';
      console.log(`ver3. 🌍 Server Environment: ${serverEnv}`);
      baseTime = parseTimeWithKST(consultingStartedAt);
      console.log('ver3. create baseTime for END status:', baseTime);
    }

    if (!baseTime) {
      console.log('ver3. No valid baseTime found, resetting timer to 0');
      setTotalSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 즉시 한 번 실행하여 초기값 설정
    const calculateElapsedTime = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - baseTime!.getTime();
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
  }, [consultationId, consultingStartedAt, isConsulting, createdAt, status]);

  // 시간 포맷팅 (MM분 SS초)
  const formattedTime = useMemo(() => {
    if (totalSeconds === 0) {
      return '00분 00초';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}분 ${seconds.toString().padStart(2, '0')}초`;
  }, [totalSeconds]);

  return {
    formattedTime,
    totalSeconds,
  };
};

// 상담 종료 시 타이머 정리를 위한 유틸리티 함수 (더 이상 필요하지 않음)
// React 훅이 자동으로 cleanup을 처리합니다.
export const cleanupConsultationTimer = (consultationId: string) => {
  console.log(
    `Timer cleanup for ${consultationId} - handled by React useEffect cleanup`
  );
};
