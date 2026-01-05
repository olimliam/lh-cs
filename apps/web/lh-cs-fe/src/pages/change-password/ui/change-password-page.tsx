import { useCallback, useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PasswordChangeDialog } from '@/pages/change-password/ui/change-password-change-dialog';
import {
  changePassword as changePasswordApi,
  useAuth,
  useLogout,
} from '@/features/auth';
import { useAuthStore } from '@/features/auth/model/store';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { getProfile } from '@/features/auth/api/auth-api';
import type { AxiosError } from 'axios';
import { ToastProvider } from '@/shared/contexts/toast-context';
import { PASSWORD_RULE_REGEX } from '@/shared/model/validation-const';

const PASSWORD_RULE_MESSAGE =
  '영문, 숫자, 특수기호 모두 조합하여 8자리 이상으로 입력해주세요.';
const PASSWORD_MISMATCH_MESSAGE =
  '비밀번호가 일치하지 않았습니다. 다시 시도해 보세요.';

interface ChangePasswordLocationState {
  redirectTo?: string;
  loginPassword?: string;
}

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, passwordChangeRequired } = useAuth();
  const toast = useToastMessages();
  const logoutMutation = useLogout();
  const setUser = useAuthStore((state) => state.setUser);
  const setPasswordChangeRequired = useAuthStore(
    (state) => state.setPasswordChangeRequired
  );

  const state = useMemo(
    () => location.state as ChangePasswordLocationState | null,
    [location.state]
  );

  const redirectTo = state?.redirectTo ?? '/admin/consultation';
  const currentPassword = state?.loginPassword ?? '';

  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    showNewPassword: false,
    showConfirmPassword: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!passwordChangeRequired) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (!currentPassword) {
      toast.showError(
        '비밀번호 변경 정보를 확인할 수 없습니다. 다시 로그인해주세요.'
      );
      logoutMutation.mutate();
      navigate('/login', { replace: true });
    }
  }, [
    currentPassword,
    isAuthenticated,
    logoutMutation,
    navigate,
    passwordChangeRequired,
    redirectTo,
    toast,
  ]);

  const resetDialogState = useCallback(() => {
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
    });
    setPasswordErrors({ newPassword: '', confirmPassword: '' });
    setPasswordMessage('');
    setIsSubmitting(false);
  }, []);

  const handleFieldChange = useCallback(
    (field: 'newPassword' | 'confirmPassword', value: string) => {
      setPasswordForm((prev) => ({ ...prev, [field]: value }));
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
      setPasswordMessage('');
    },
    []
  );

  const handleToggleNewPasswordVisibility = useCallback(() => {
    setPasswordForm((prev) => ({
      ...prev,
      showNewPassword: !prev.showNewPassword,
    }));
  }, []);

  const handleToggleConfirmPasswordVisibility = useCallback(() => {
    setPasswordForm((prev) => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  }, []);

  const handleCancel = useCallback(() => {
    setIsDialogOpen(false);
    resetDialogState();
    logoutMutation.mutate();
    navigate('/login', { replace: true });
  }, [logoutMutation, navigate, resetDialogState]);

  const handleConfirm = useCallback(async () => {
    const { newPassword, confirmPassword } = passwordForm;

    const nextErrors = {
      newPassword: '',
      confirmPassword: '',
    };

    if (!PASSWORD_RULE_REGEX.test(newPassword)) {
      nextErrors.newPassword = PASSWORD_RULE_MESSAGE;
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = PASSWORD_MISMATCH_MESSAGE;
    }

    if (nextErrors.newPassword || nextErrors.confirmPassword) {
      setPasswordErrors(nextErrors);
      return;
    }

    if (!currentPassword) {
      setPasswordMessage(
        '비밀번호 변경 정보를 확인할 수 없습니다. 다시 로그인해주세요.'
      );
      logoutMutation.mutate();
      navigate('/login', { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await changePasswordApi({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!response.success) {
        const message =
          response.message ||
          '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
        setPasswordMessage(message);
        return;
      }

      toast.showSuccess('비밀번호가 변경되었습니다.');
      resetDialogState();
      setIsDialogOpen(false);
      setPasswordChangeRequired(false);

      const updatedProfile = await getProfile();
      setUser(updatedProfile);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : '비밀번호 변경 중 오류가 발생했습니다.');
      setPasswordMessage(message);
      toast.showError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentPassword,
    logoutMutation,
    navigate,
    passwordForm,
    redirectTo,
    resetDialogState,
    setPasswordChangeRequired,
    setUser,
    toast,
  ]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <PasswordChangeDialog
        open={isDialogOpen}
        form={passwordForm}
        errors={passwordErrors}
        helperMessage={passwordMessage}
        isSubmitting={isSubmitting}
        onFieldChange={handleFieldChange}
        onToggleNewPasswordVisibility={handleToggleNewPasswordVisibility}
        onToggleConfirmPasswordVisibility={
          handleToggleConfirmPasswordVisibility
        }
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ToastProvider>
  );
};
