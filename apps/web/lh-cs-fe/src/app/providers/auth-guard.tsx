import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/features/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중인 경우 로딩 스피너 표시
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    // 현재 경로를 state로 저장해서 로그인 후 되돌아갈 수 있도록 함
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
