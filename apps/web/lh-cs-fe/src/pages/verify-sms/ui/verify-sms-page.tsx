import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAuth,
  useSendLoginCode,
  useVerifyLoginCode,
  useLogout,
} from '@/features/auth';
import { VerifySmsDialog } from '@/pages/verify-sms/ui/verify-sms-dialog';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { normalizePhoneNumber } from '@/shared/hooks/phone-verification-hooks';
import { getProfile } from '@/features/auth/api/auth-api';
import { ToastProvider } from '@/shared/contexts/toast-context';
import { ApiError } from '@/shared/api/api-error.util';

interface VerifySmsLocationState {
  redirectTo?: string;
  loginPassword?: string;
  passwordChangeRequired?: boolean;
}

export const VerifySmsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, passwordChangeRequired } = useAuth();
  const toast = useToastMessages();
  const sendLoginCodeMutation = useSendLoginCode();
  const verifyLoginCodeMutation = useVerifyLoginCode();
  const logoutMutation = useLogout();

  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const {
    timeLeft,
    isActive: isCountdownActive,
    start: startCountdown,
    reset: resetCountdown,
    formatTime,
  } = useCountdown({
    initialTime: 180,
    onTimeUp: () => {
      setVerificationError('인증 시간이 만료되었습니다.');
    },
  });

  const state = useMemo(
    () => location.state as VerifySmsLocationState | null,
    [location.state]
  );

  const redirectTo = state?.redirectTo ?? '/admin/consultation';
  const initialLoginPassword = state?.loginPassword ?? '';
  const initialPasswordChangeRequired =
    state?.passwordChangeRequired ?? passwordChangeRequired;

  const requestVerificationCode = useCallback(async () => {
    try {
      await sendLoginCodeMutation.mutateAsync();
      resetCountdown();
      startCountdown();
      toast.showSuccess('인증번호가 발송되었습니다.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 발송에 실패했습니다.';
      toast.showError(message);
      throw new Error(message);
    }
  }, [sendLoginCodeMutation, resetCountdown, startCountdown, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProfileAndSendCode = async () => {
      try {
        const profile = await getProfile();
        const digits = profile.phoneNumber?.replace(/[^0-9]/g, '') ?? '';

        if (!digits) {
          toast.showError(
            '등록된 휴대전화 번호가 없어 인증을 진행할 수 없습니다. 관리자에게 문의해주세요.'
          );
          logoutMutation.mutate();
          navigate('/login', { replace: true });
          return;
        }

        setPhoneNumberDisplay(normalizePhoneNumber(digits));
        setVerificationCode('');
        setVerificationError('');
        await requestVerificationCode();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '2차 인증을 진행할 수 없습니다. 관리자에게 문의해주세요.';
        toast.showError(message);
        logoutMutation.mutate();
        navigate('/login', { replace: true });
      }
    };

    fetchProfileAndSendCode();
  }, [isAuthenticated]);

  const handleResendCode = useCallback(async () => {
    try {
      await requestVerificationCode();
      setVerificationCode('');
      setVerificationError('');
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.'
      );
    }
  }, [requestVerificationCode]);

  const handleChangeVerificationCode = useCallback(
    (value: string) => {
      setVerificationCode(value);
      if (verificationError) {
        setVerificationError('');
      }
    },
    [verificationError]
  );

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setVerificationError('인증번호는 숫자 6자리입니다.');
      return;
    }

    try {
      const verified =
        await verifyLoginCodeMutation.mutateAsync(verificationCode);
      if (!verified) {
        setVerificationError('인증번호가 일치하지 않습니다.');
        return;
      }

      toast.showSuccess('인증이 완료되었습니다.');
      resetCountdown();
      setVerificationCode('');
      setVerificationError('');
      setIsDialogOpen(false);

      if (initialPasswordChangeRequired) {
        if (!initialLoginPassword) {
          toast.showError(
            '비밀번호 변경 정보가 손실되었습니다. 다시 로그인해주세요.'
          );
          logoutMutation.mutate();
          navigate('/login', { replace: true });
          return;
        }

        navigate('/change-password-required', {
          replace: true,
          state: {
            redirectTo,
            loginPassword: initialLoginPassword,
          },
        });
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 확인 중 오류가 발생했습니다.';

      // ✅ API 응답의 code 추출
      let errorCode: string | undefined;
      if (error instanceof ApiError && error.raw) {
        errorCode = (error.raw as Record<string, unknown>)?.code as string;
      }

      if (errorCode === 'VERIFICATION_ATTEMPT_EXCEEDED') {
        console.log('Verification attempt exceeded, redirecting to login.');
        toast.showError(
          '인증번호 입력 제한 횟수를 초과했습니다. 다시 시도해주세요.'
        );
        // 2차 인증 실패 시 토큰 제거 (로그아웃 처리)
        logoutMutation.mutate();
        return;
      }

      setVerificationError(message);
    }
  }, [
    initialLoginPassword,
    initialPasswordChangeRequired,
    logoutMutation,
    navigate,
    redirectTo,
    resetCountdown,
    toast,
    verificationCode,
    verifyLoginCodeMutation,
  ]);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    logoutMutation.mutate();
    navigate('/login', { replace: true });
  }, [logoutMutation, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <VerifySmsDialog
        open={isDialogOpen}
        phoneNumberDisplay={phoneNumberDisplay}
        verificationCode={verificationCode}
        verificationError={verificationError}
        isCountdownActive={isCountdownActive}
        timeLeft={timeLeft}
        formatTime={formatTime}
        isSendCodePending={sendLoginCodeMutation.isPending}
        isVerifyPending={verifyLoginCodeMutation.isPending}
        onChangeVerificationCode={handleChangeVerificationCode}
        onResendCode={handleResendCode}
        onCancel={handleCancel}
        onVerify={handleVerifyCode}
      />
    </ToastProvider>
  );
};
