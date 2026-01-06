import { EnterCodeModal, LoadingDialog } from '@/features/webrtc-viewer';
import { ReactNode } from 'react';
interface VisitorTourGuardProps {
  isCodeSubmitted: boolean;
  fallbackContainer: ReactNode;
  children: ReactNode;
  onEnterCodeSubmit: (enterCode: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 방문자 투어 접근을 관리하는 가드 컴포넌트
 * consultationId가 없으면 EnterCodeModal을 표시하고,
 * 있으면 children을 렌더링합니다.
 */
export const VisitorTourGuard = ({
  isCodeSubmitted,
  fallbackContainer,
  children,
  onEnterCodeSubmit,
  isLoading,
}: VisitorTourGuardProps) => {
  if (!isCodeSubmitted) {
    return (
      <>
        {fallbackContainer}
        <EnterCodeModal
          open={true}
          onSubmit={onEnterCodeSubmit}
          loading={isLoading}
        />

        {isLoading && <LoadingDialog />}
      </>
    );
  }

  // 인증된 경우 children 렌더링
  return <>{children}</>;
};
