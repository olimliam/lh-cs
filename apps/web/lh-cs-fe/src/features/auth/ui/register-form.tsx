import { normalizePhoneNumber } from '@/shared/hooks/phone-verification-hooks';
import { useCountdown } from '@/shared/hooks/use-countdown';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import styled from '@emotion/styled';
import {
  CircularProgress,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import { useSendRegisterCode, useVerifyRegisterCode } from '../api/auth-hooks';
import { RegisterPayload } from '../model/types';
import { Button, CountdownText, VerificationIcon } from '@/shared/ui';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { CommonTextField, LabelText } from '@/shared/ui/input/input.styles';
import {
  PHONE_REGEX,
  VERIFICATION_REGEX,
} from '@/shared/model/validation-const';
import { ApiError } from '@/shared/api/api-error.util';

const InputRowBox = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  & + div {
    margin-top: 14px !important;
  }
  &.verification {
    margin-top: 8px !important;
    padding-bottom: 10px;
  }
`;

interface RegisterFormProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  form: RegisterPayload;
  updateField: <K extends keyof RegisterPayload>(
    key: K,
    value: RegisterPayload[K]
  ) => void;
  phoneNumberForm: {
    phoneNumber: string;
    verificationCode: string;
  };
  formErrors: Record<string, string>;
  phoneError: Record<string, string>;
  setPhoneError: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
}

export const RegisterForm = forwardRef<HTMLDivElement, RegisterFormProps>(
  (
    {
      scrollRef,
      form,
      phoneNumberForm,
      updateField,
      formErrors,
      phoneError,
      setPhoneError,
      isSubmitting,
    }: RegisterFormProps,
    ref
  ) => {
    const [isSuccessSentCode, setIsSuccessSentCode] = useState<
      boolean | undefined
    >();
    const [isSuccessVerified, setIsSuccessVerified] = useState<boolean>(false);

    const toast = useToastMessages();
    const sendCodeMutation = useSendRegisterCode();
    const verifyCodeMutation = useVerifyRegisterCode();

    const [showPasswords, setShowPasswords] = useState({
      new: false,
      confirm: false,
    });
    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
      setShowPasswords((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    };
    // countdown hook
    const countdown = useCountdown({
      initialTime: 180,
      onTimeUp: () => {
        toast.showError(
          '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.'
        );
        setIsSuccessSentCode(undefined);
      },
    });

    const handleSendCode = async () => {
      const deleteDashPhoneNumber = phoneNumberForm.phoneNumber.replace(
        /-/g,
        ''
      );
      if (!PHONE_REGEX.test(deleteDashPhoneNumber)) {
        setPhoneError((prev) => ({
          ...prev,
          phoneNumber: '전화번호 형식을 확인해주세요.(11자리)',
        }));
        return;
      }

      try {
        const result = await sendCodeMutation.mutateAsync(
          deleteDashPhoneNumber
        );
        setIsSuccessSentCode(result ? true : false);
        toast.showSuccess('인증번호가 발송되었습니다.');
        countdown.reset();
        countdown.start();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '인증번호 발송 중 오류가 발생했습니다.';
        toast.showError(message);
      }
    };

    const handleVerifyCode = async () => {
      if (countdown.timeLeft <= 0) {
        toast.showError(
          '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.'
        );
        return;
      }

      if (!VERIFICATION_REGEX.test(phoneNumberForm.verificationCode)) {
        setPhoneError((prev) => ({
          ...prev,
          verificationCode: '인증번호는 숫자 6자리여야 합니다.',
        }));
        return;
      }

      try {
        const deleteDashPhoneNumber = phoneNumberForm.phoneNumber.replace(
          /-/g,
          ''
        );
        const verified = await verifyCodeMutation.mutateAsync({
          phoneNumber: deleteDashPhoneNumber,
          verificationCode: phoneNumberForm.verificationCode,
        });

        if (!verified) {
          toast.showError('인증번호가 일치하지 않습니다.');
          return;
        }

        countdown.pause();
        setIsSuccessSentCode(undefined);
        setIsSuccessVerified(true);
        toast.showSuccess('전화번호 인증이 완료되었습니다.');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '인증번호 검증 중 오류가 발생했습니다.';

        // ✅ API 응답의 code 추출
        let errorCode: string | undefined;
        if (error instanceof ApiError && error.raw) {
          errorCode = (error.raw as Record<string, unknown>)?.code as string;
        }

        if (errorCode === 'VERIFICATION_ATTEMPT_EXCEEDED') {
          toast.showError(
            '인증번호 입력 제한 횟수를 초과했습니다. 다시 시도해주세요.'
          );
          updateField('verificationCode', '');
          setIsSuccessSentCode(undefined);
          return;
        }

        toast.showError(message);
      }
    };

    useEffect(() => {
      if (isSuccessSentCode !== undefined && scrollRef.current) {
        // ✅ 방법 1: 스크롤 컨테이너를 최하단으로 이동
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, [isSuccessSentCode, scrollRef]);

    return (
      <>
        <Stack
          spacing={3}
          sx={{
            margin: '24px auto auto auto',
            fontFamily: 'inherit',
            gap: '16px',
            height: '100%',
          }}
          ref={ref}
        >
          <InputRowBox>
            <LabelText htmlFor='username'>아이디</LabelText>
            <CommonTextField
              id='username'
              placeholder='6자리 숫자로 입력해 주세요.'
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={isSubmitting}
            />
          </InputRowBox>

          <InputRowBox>
            <LabelText htmlFor='password'>비밀번호</LabelText>
            <div className='relative w-[calc(100%-104px)]'>
              <CommonTextField
                id='password'
                type={showPasswords.new ? 'text' : 'password'}
                placeholder='비밀번호를 입력해 주세요.'
                value={form.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
                error={!!formErrors.password}
                helperText={
                  formErrors.password ||
                  '※ 영문 대·소문자, 숫자, 특수기호를 모두 조합해서 8~16자로 입력해 주세요.'
                }
                disabled={isSubmitting}
                inputProps={{
                  maxLength: 16, // ✅ HTML input 속성만 여기에
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        aria-label={
                          showPasswords.new
                            ? '비밀번호 숨기기'
                            : '비밀번호 보기'
                        }
                        edge='end'
                        size='small'
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </InputRowBox>
          <InputRowBox>
            <LabelText htmlFor='passwordCheck'>비밀번호 확인</LabelText>
            <div className='relative w-[calc(100%-104px)]'>
              <CommonTextField
                id='passwordCheck'
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder='비밀번호를 한번 더 입력해 주세요.'
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                disabled={isSubmitting}
                inputProps={{
                  maxLength: 16, // ✅ HTML input 속성만 여기에
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        aria-label={
                          showPasswords.confirm
                            ? '비밀번호 숨기기'
                            : '비밀번호 보기'
                        }
                        edge='end'
                        size='small'
                      >
                        {showPasswords.confirm ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </InputRowBox>

          <Divider />
          <InputRowBox>
            <LabelText htmlFor='name'>이름</LabelText>
            <CommonTextField
              id='name'
              placeholder='10자리 이내로 이름을 입력해 주세요.'
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 10,
              }}
            />
          </InputRowBox>

          <InputRowBox>
            <LabelText htmlFor='department'>부서</LabelText>
            <CommonTextField
              id='department'
              placeholder='10자리 이내로 부서명을 입력해 주세요.'
              value={form.department}
              onChange={(event) =>
                updateField('department', event.target.value)
              }
              error={!!formErrors.department}
              helperText={formErrors.department}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 10,
              }}
            />
          </InputRowBox>

          <InputRowBox>
            <LabelText htmlFor='phoneNumber'>전화번호</LabelText>
            <CommonTextField
              id='phoneNumber'
              placeholder='휴대전화번호를 입력해 주세요.'
              value={phoneNumberForm.phoneNumber}
              onChange={(event) =>
                updateField(
                  'phoneNumber',
                  normalizePhoneNumber(event.target.value)
                )
              }
              error={!!phoneError.phoneNumber}
              helperText={phoneError.phoneNumber}
              disabled={isSubmitting || isSuccessSentCode || isSuccessVerified}
            />
            {!isSuccessVerified ? (
              <Button
                type='button' // ✅ 추가: submit 방지
                variant='opacityPrimary'
                size='sm'
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending}
              >
                {sendCodeMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  '인증번호 발송'
                )}
              </Button>
            ) : (
              <div className='flex items-center rounded-[4px] bg-[rgba(144,195,31,0.10)] p-1 text-[14px] text-[#90C31F]'>
                <VerificationIcon />
                인증
              </div>
            )}
          </InputRowBox>

          {isSuccessSentCode !== undefined && (
            <div className='w-full pb-[24px]'>
              <Divider />
              <InputRowBox className='verification'>
                <LabelText htmlFor='verificationCode'>인증번호</LabelText>
                <CommonTextField
                  id='verificationCode'
                  placeholder='인증번호 6자리를 입력해 주세요.'
                  value={phoneNumberForm.verificationCode}
                  onChange={(event) =>
                    updateField(
                      'verificationCode',
                      event.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    )
                  }
                  error={!!phoneError.verificationCode}
                  helperText={phoneError.verificationCode}
                  disabled={verifyCodeMutation.isPending}
                  inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                />
                <>
                  {countdown.isActive && countdown.timeLeft > 0 && (
                    <CountdownText className='countdown'>
                      {countdown.formatTime(countdown.timeLeft)}
                    </CountdownText>
                  )}
                </>
              </InputRowBox>

              <Button
                type='button' // ✅ 추가: submit 방지
                variant='primary'
                fullWidth
                size={'md'}
                className='!mt-0 !leading-[50px]'
                onClick={handleVerifyCode}
                disabled={verifyCodeMutation.isPending}
              >
                {verifyCodeMutation.isPending ? (
                  <CircularProgress size={48} />
                ) : (
                  '인증 확인'
                )}
              </Button>
            </div>
          )}
        </Stack>
      </>
    );
  }
);
