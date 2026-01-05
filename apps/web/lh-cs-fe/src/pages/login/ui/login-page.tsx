import { AuthResponse, LoginForm, useAuth } from '@/features/auth';
import { ToastProvider } from '@/shared/contexts/toast-context';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { ArrowBackIcon, BASE_FONT_FAMILY, Button } from '@/shared/ui';
import { media } from '@/shared/utils';
import styled from '@emotion/styled';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  height: var(--vh);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 16px;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  padding: 48px 24px;

  @media (min-width: 600px) {
    max-width: 600px;
    padding: 64px 32px;
  }

  @media (min-width: 768px) {
    max-width: 768px;
    padding: 80px 40px;
  }

  @media (min-width: 1024px) {
    max-width: 1024px;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  gap: 24px;

  @media (min-width: 600px) {
    max-width: 400px;
    gap: 32px;
  }

  @media (min-width: 768px) {
    max-width: 341px;
    gap: 16px;
  }
`;

const LogoTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.img`
  width: 150px;
  height: 93px;

  @media (min-width: 600px) {
    width: 165px;
    height: 103px;
  }

  @media (min-width: 768px) {
    width: 180px;
    height: 112px;
  }
`;

const TitleText = styled.p`
  color: #58686c;
  text-align: center;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -1.2px;
  margin: 0;
  padding-bottom: 4px;

  @media (min-width: 600px) {
    font-size: 27px;
    letter-spacing: -1.35px;
  }

  @media (min-width: 768px) {
    font-size: 30px;
    letter-spacing: -1.5px;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    max-width: 341px;
  }
`;

const HelpText = styled.p`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 13px;
  line-height: 1.3;
  color: #58686c;
  text-align: center;
  margin: 0;

  @media (min-width: 600px) {
    font-size: 13.5px;
  }

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const BoldText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
`;

const GoHomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  left: 24px;
  top: 24px;
  padding: 8px;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 20px;
  font-weight: 500;
  line-height: 130%; /* 26px */
  color: #727171;
  ${media.tablet`
    top: 16px;
    left: 16px;
    font-size: 16px;
    & svg {
      width: 16px;
      height: 16px;
    }
  `}
`;
interface LoginSuccessPayload {
  auth: AuthResponse;
  redirectTo: string;
  loginPassword: string;
}

export const LoginPage = () => {
  const { isTablet } = useDeviceDetector();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const state = location.state as { from?: { pathname: string } } | null;

  const handleLoginSuccess = useCallback(
    ({ auth, redirectTo, loginPassword }: LoginSuccessPayload) => {
      const target = redirectTo ?? '/admin/consultation';
      navigate('/verify-sms', {
        replace: true,
        state: {
          redirectTo: target,
          loginPassword,
          passwordChangeRequired: auth.passwordChangeRequired,
        },
      });
    },
    [navigate]
  );

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      const fallback = state?.from?.pathname ?? '/admin/consultation';
      // 이미 인증된 사용자가 /login에 접근한 경우에는 원래 위치로 돌려보내고,
      // SMS 인증은 로그인 성공 시점에만 수행한다.
      navigate(fallback, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, state?.from?.pathname]);

  if (isLoading) {
    return null;
  }

  return (
    <ToastProvider>
      <LoginContainer>
        <GoHomeButton onClick={() => navigate('/')}>
          <ArrowBackIcon
            width={isTablet ? 16 : 24}
            height={isTablet ? 16 : 24}
          />
          {`홈으로 돌아가기`}
        </GoHomeButton>
        <ContentContainer>
          <InnerContainer>
            <LogoTitleContainer>
              <Logo src='/logo/lh-brand-logo.svg' alt='LH Logo' />
              <div>
                <TitleText>LH집속속 상담사 서비스</TitleText>
                <p className='text-center text-[#777777]'>
                  본 서비스는 상담사 전용 서비스입니다.
                </p>
              </div>
            </LogoTitleContainer>

            <FormContainer>
              <LoginForm
                disableAutoRedirect
                onLoginSuccess={handleLoginSuccess}
              />
            </FormContainer>

            <Button
              variant='outlinePrimary'
              fullWidth
              className='!rounded-1 !h-auto !p-[8px_22px]'
              onClick={() => navigate('/register')}
            >
              회원가입
            </Button>
            <HelpText>
              ※ 비밀번호가 기억나지 않는 경우,{' '}
              <BoldText>관리자에게 요청</BoldText>해주세요.
            </HelpText>
            {/* <HelpText>
              신규 사용자는
              <LinkText onClick={() => navigate('/register')}>
                회원가입
              </LinkText>
              을 진행해주세요.
            </HelpText> */}
          </InnerContainer>
        </ContentContainer>
      </LoginContainer>
    </ToastProvider>
  );
};
