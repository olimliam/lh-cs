import { useAuth } from '@/features';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useEffect, useRef } from 'react';

export const TourAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { showCannotEnterRoom } = useToastMessages();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // 로딩이 완료되고 인증되지 않은 경우에만 실행 (한 번만)
    if (!isLoading && !isAuthenticated && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      showCannotEnterRoom(
        '비정상적인 접근입니다. 상담실에 입장할 수 없습니다.'
      );

      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [isAuthenticated, isLoading, showCannotEnterRoom]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div>인증 확인 중...</div>;
  }

  return <>{children}</>;
};
