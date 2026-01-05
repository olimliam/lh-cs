import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLoginForm as useLoginFormQuery, useAuth } from '../api/auth-hooks';
import type { AuthResponse, LoginCredentials } from '../model/types';
import {
  LoginFormContainer,
  FormStack,
  InputStack,
  StyledTextField,
  LoginButton,
  ErrorAlert,
} from './login-form.styles';

interface LoginFormProps {
  onLoginSuccess?: (params: {
    auth: AuthResponse;
    redirectTo: string;
    loginPassword: string;
  }) => void;
  disableAutoRedirect?: boolean;
}

export const LoginForm = ({
  onLoginSuccess,
  disableAutoRedirect = false,
}: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { login, isLoading, error, reset } = useLoginFormQuery();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // 로그인 성공 시 리다이렉트
  useEffect(() => {
    if (disableAutoRedirect || !isAuthenticated) {
      return;
    }

    const state = location.state as { from?: { pathname: string } } | null;
    const from = state?.from?.pathname || '/admin/consultation';
    navigate(from, { replace: true });
  }, [disableAutoRedirect, isAuthenticated, navigate, location]);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.username) {
      errors.username = '아이디를 입력해주세요.';
    } else if (!/^\d{6}$/.test(formData.username)) {
      errors.username = '아이디는 숫자 6자리여야 합니다.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      errors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData);

    if (!result.success) {
      // 로그인 실패 시 에러는 이미 hook에서 처리됨
      console.error('Login failed:', result.error);
      return;
    }

    // TODO: 로그인이 성공했다면 login-page 컴포넌트에 알리고 전화번호 인증이 진행되도록 팝업을 열어어한다.
    if (onLoginSuccess && result.data) {
      const state = location.state as { from?: { pathname: string } } | null;
      const from = state?.from?.pathname || '/admin/consultation';
      onLoginSuccess({
        auth: result.data,
        redirectTo: from,
        loginPassword: formData.password,
      });
    }
  };

  const handleFieldChange = (field: keyof LoginCredentials, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 에러가 있으면 입력 시 에러 클리어
    if (field === 'username' && formErrors.username) {
      setFormErrors((prev) => ({ ...prev, username: undefined }));
    }
    if (field === 'password' && formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }

    // API 에러도 클리어
    if (error) {
      reset();
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginFormContainer onSubmit={onSubmit}>
      <FormStack>
        {/* 입력 필드들 */}
        <InputStack>
          {/* 아이디 입력 필드 */}
          <StyledTextField
            fullWidth
            label='아이디'
            variant='outlined'
            value={formData.username}
            onChange={(e) =>
              handleFieldChange(
                'username',
                e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
              )
            }
            placeholder='숫자 6자리'
            error={!!formErrors.username}
            helperText={formErrors.username}
            disabled={isLoading}
            autoComplete='username'
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
          />

          {/* 비밀번호 입력 필드 */}
          <StyledTextField
            fullWidth
            label='Password'
            variant='outlined'
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            placeholder='Password'
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={isLoading}
            autoComplete='current-password'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    disabled={isLoading}
                    edge='end'
                    size='small'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </InputStack>

        {/* 로그인 버튼 */}
        <LoginButton type='submit' disabled={isLoading}>
          {isLoading && (
            <CircularProgress
              size={60}
              sx={{ color: 'white', marginRight: '8px' }}
            />
          )}
          {isLoading ? '로그인 중...' : '로그인'}
        </LoginButton>

        {/* 에러 메시지 */}
        {error && <ErrorAlert severity='error'>{error}</ErrorAlert>}
      </FormStack>
    </LoginFormContainer>
  );
};
