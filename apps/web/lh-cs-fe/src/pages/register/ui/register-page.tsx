import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/ui/register-form';
import {
  RegisterPayload,
  RegisterResponse,
  useRegister,
} from '@/features/auth';
import { useMemo, useRef, useState } from 'react';
import { Button, CheckBox } from '@/shared/ui';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { media } from '@/shared/utils';
import { RegisterPolicyModal } from '@/features/auth/ui/register-policy-modal';
import {
  PASSWORD_RULE_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
} from '@/shared/model/validation-const';

const Layout = styled('div')`
  font-family: 'Pretendard';
  background: #f5f5f5;
`;
const CustomPaper = styled(Paper)({
  width: '100%',
  height: '100%',
  maxHeight: '984px',
  borderRadius: '8px',
});
const MainTitle = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  textAlign: 'left',
  color: '#0055A2',
  fontFamily: 'inherit',
});

const SubTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  textAlign: 'left',
  color: theme.palette.grey[600],
  marginTop: '4px!important',
  fontFamily: 'inherit',
}));

const JoinTitleBox = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const LogoImg = styled('img')({
  width: '75px',
});

const FormTitle = styled('div')`
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  & h4 {
    color: #58686c;
    font-size: 20px;
    font-weight: 700;
  }

  ${media.tablet`
    font-size: 16px;
  `}
`;
const PolicyAgreeBox = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  width: 100%;

  ${media.tablet`
    padding: 24px 0 16px 0;
  `}
`;
const initialFormState: RegisterPayload = {
  name: '',
  username: '',
  phoneNumber: '',
  verificationCode: '',
  role: UserRoleEnum.CONSULTANT,
  department: '',
  password: '',
  confirmPassword: '',
  isConfirmedTerms: false,
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToastMessages();

  const scrollRef = useRef(null);
  const [form, setForm] = useState<RegisterPayload>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [phoneNumberForm, setPhoneNumberForm] = useState<{
    phoneNumber: string;
    verificationCode: string;
  }>({ phoneNumber: '', verificationCode: '' });
  const [phoneError, setPhoneError] = useState<Record<string, string>>({});
  const [isOpenPolicyPopup, setIsOpenPolicyPopup] = useState<boolean>(false);

  const registerMutation = useRegister();

  const isSubmitting = useMemo(
    () => registerMutation.isPending,
    [registerMutation.isPending]
  );

  const updateField = <K extends keyof RegisterPayload>(
    key: K,
    value: RegisterPayload[K]
  ) => {
    if (key === 'phoneNumber' || key === 'verificationCode') {
      setPhoneNumberForm((prev) => ({ ...prev, [key]: value }));
      setPhoneError((prev) => ({ ...prev, [key]: '' }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFormErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const deleteDashPhoneNumber = phoneNumberForm.phoneNumber.replace(/-/g, '');

    if (!USERNAME_REGEX.test(form.username)) {
      errors.username = '※ 아이디는 숫자 6자리여야 합니다.';
    }

    if (!PASSWORD_RULE_REGEX.test(form.password)) {
      errors.password =
        '※ 영문 대·소문자, 숫자, 특수기호를 모두 조합해서 8~16자로 입력해 주세요.';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '※ 비밀번호가 일치하지 않습니다.';
    }

    if (!form.name.trim()) {
      errors.name = '※ 이름을 입력해주세요.';
    }

    if (!form.isConfirmedTerms) {
      errors.isConfirmedTerms = '※ 필수 약관에 동의해 주세요.';
    }

    setFormErrors(errors);

    //전화번호는 validation 체크를 다르게 진행
    if (!PHONE_REGEX.test(deleteDashPhoneNumber)) {
      setPhoneError((prev) => ({
        ...prev,
        phoneNumber: '※ 전화번호 형식이 올바르지 않습니다.(11자리)',
      }));
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!phoneNumberForm.verificationCode) {
      toast.showError('전화번호 인증을 완료해주세요.');
      return;
    }

    // return;
    try {
      const deleteDashPhoneNumber = phoneNumberForm.phoneNumber.replace(
        /-/g,
        ''
      );
      const result = await registerMutation.mutateAsync({
        ...form,
        phoneNumber: deleteDashPhoneNumber,
        verificationCode: phoneNumberForm.verificationCode,
      });
      toast.showSuccess(
        '회원가입 신청이 완료되었습니다. 관리자 승인 후 이용할 수 있습니다.'
      );
      setForm(initialFormState);
      handleSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '회원가입 요청 중 오류가 발생했습니다.';
      toast.showError(message);
    }
  };

  const handleSuccess = (_result: RegisterResponse) => {
    navigate('/login', {
      replace: true,
    });
  };

  return (
    <>
      <Layout>
        <Box
          sx={{
            height: `var(--vh)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '48px 0',
            width: '100%',
            maxWidth: '592px',
            margin: 'auto',

            '@media screen and (max-width: 1024px)': {
              padding: '36px 0',
            },
          }}
        >
          <CustomPaper elevation={6}>
            <Stack
              spacing={3}
              sx={{
                height: '100%',
                maxHeight: 'calc(100% - 156px)',
                padding: '36px 36px 0 36px',

                '@media screen and (max-width: 1024px)': {
                  padding: '24px 24px 0 24px',
                  maxHeight: 'calc(100% - 137px)',
                },
              }}
            >
              <JoinTitleBox>
                <div>
                  <MainTitle variant='h3'>
                    LH집속속 상담사 서비스 회원가입
                  </MainTitle>
                  <SubTitle>본 서비스는 상담사 전용 서비스입니다.</SubTitle>
                </div>

                <LogoImg src='/logo/lh-brand-logo.svg' alt='LH 로고' />
              </JoinTitleBox>

              <Box
                component='form'
                id='register-form'
                ref={scrollRef}
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  width: '100%',
                  marginTop: '36px!important',
                  height: '100%',
                  overflowY: 'auto',

                  '@media screen and (max-width: 1024px)': {
                    marginTop: '24px!important',
                  },
                }}
              >
                <div className={'h-full'}>
                  <FormTitle>
                    <h4>회원정보</h4>
                    <span>※ 모든 항목은 필수입력 항목입니다.</span>
                  </FormTitle>

                  <RegisterForm
                    scrollRef={scrollRef}
                    form={form}
                    updateField={updateField}
                    formErrors={formErrors}
                    phoneNumberForm={phoneNumberForm}
                    phoneError={phoneError}
                    setPhoneError={setPhoneError}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </Box>
            </Stack>

            <Stack
              sx={{
                padding: '0 36px 36px 36px',
                borderTop: '1px solid #ddd',

                '@media screen and (max-width: 1024px)': {
                  padding: '0 24px 24px 24px',
                },
              }}
            >
              <PolicyAgreeBox>
                <CheckBox
                  checked={form.isConfirmedTerms}
                  onChange={(event) =>
                    updateField('isConfirmedTerms', event.target.checked)
                  }
                  label='[필수] 개인정보 수집 및 이용 동의'
                />

                <button
                  type='button'
                  className='text-[14px] text-[#666]'
                  onClick={() => setIsOpenPolicyPopup(true)}
                >
                  전문보기
                </button>

                {formErrors.isConfirmedTerms && (
                  <div className='absolute bottom-2 text-[12px] text-[#D32F2F]'>
                    {formErrors.isConfirmedTerms}
                  </div>
                )}
              </PolicyAgreeBox>

              <div className='flex w-full items-center gap-4'>
                <Button
                  fullWidth
                  type='button'
                  variant='outlinePrimary'
                  disabled={registerMutation.isPending}
                  onClick={() => navigate('/login')}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  type='submit'
                  form='register-form'
                  variant='primary'
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    '가입 신청'
                  )}
                </Button>
              </div>
            </Stack>
          </CustomPaper>
        </Box>
      </Layout>

      <RegisterPolicyModal
        isOpen={isOpenPolicyPopup}
        onClose={() => setIsOpenPolicyPopup(false)}
      />
    </>
  );
};
