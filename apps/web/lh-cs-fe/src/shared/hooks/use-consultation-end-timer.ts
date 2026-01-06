import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';

interface UseConsultationEndTimerProps {
  consultationId: string;
  status: ConsultationStatusEnum;
  endRequestedAt?: string | Date;
  onTimerDone?: (consultationId: string) => void;
}

interface UseConsultationEndTimerReturn {
  isEnding: boolean;
  remainingTimeText: string;
  remainingSeconds: number;
  isFinalized: boolean;
  onFinalized?: () => void;
}

const END_DELAY_MINUTES = 5; // 5분

/**
 * 상담 종료 카운트다운 타이머 훅
 * - 상담이 END 상태가 되면 5분 카운트다운 시작
 * - 5분 후 완전 종료 처리
 */
export const useConsultationEndTimer = ({
  consultationId,
  status,
  endRequestedAt,
  onTimerDone,
}: UseConsultationEndTimerProps): UseConsultationEndTimerReturn => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // END 상태이고 endRequestedAt이 있는 경우 카운트다운 시작
  const isEnding = status === ConsultationStatusEnum.END && !!endRequestedAt;

  const calculateRemainingTime = useCallback(() => {
    if (!endRequestedAt) return 0;

    const endTime = new Date(endRequestedAt);
    const finalizeTime = new Date(
      endTime.getTime() + END_DELAY_MINUTES * 60 * 1000
    );
    const now = new Date();

    const remainingMs = finalizeTime.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }, [endRequestedAt]);

  useEffect(() => {
    // END 상태가 아니거나 endRequestedAt이 없으면 타이머 중지
    if (!isEnding) {
      setRemainingSeconds(0);
      setIsFinalized(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 초기값 설정
    const initialRemaining = calculateRemainingTime();
    setRemainingSeconds(initialRemaining);

    // 이미 시간이 지났으면 즉시 완료 처리
    if (initialRemaining <= 0) {
      setIsFinalized(true);
      // 타이머 완료 콜백 호출
      if (onTimerDone) {
        onTimerDone(consultationId);
      }
      return;
    }

    // 1초마다 업데이트하는 타이머 시작
    intervalRef.current = setInterval(() => {
      const remaining = calculateRemainingTime();
      setRemainingSeconds(remaining);

      // 시간이 끝나면 완료 처리
      if (remaining <= 0) {
        setIsFinalized(true);
        // 타이머 완료 콜백 호출
        if (onTimerDone) {
          onTimerDone(consultationId);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);

    // 정리 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnding, calculateRemainingTime, consultationId, onTimerDone]);

  // 시간 포맷팅
  const remainingTimeText = useMemo(() => {
    if (!isEnding || remainingSeconds <= 0) {
      return '';
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    // 카운트다운 형식으로 표시 (MM분 SS초)
    return `${minutes.toString().padStart(2, '0')}분 ${seconds.toString().padStart(2, '0')}초`;
  }, [isEnding, remainingSeconds]);

  return {
    isEnding,
    remainingTimeText,
    remainingSeconds,
    isFinalized,
  };
};
