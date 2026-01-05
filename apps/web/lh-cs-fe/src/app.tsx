import { Suspense } from 'react';
import { AppRouter } from './app/router/routes';
import { ToastProvider } from '@/shared/contexts/toast-context';
import { ToastContainer } from '@/shared/ui';
import { AuthInitializer } from '@/features/auth';
import useViewportHeight from '@/shared/hooks/use-viewport-height'; // ✅ 추가
import { ErrorBoundary } from '@/shared/ui/error-boundary';

function App() {
  useViewportHeight(); // ✅ 최상위에서 한 번만 실행

  return (
    <ToastProvider>
      <ErrorBoundary
        fallback={
          <div className='flex h-screen w-full flex-col items-center justify-center gap-4 bg-white text-center'>
            <p className='text-lg font-semibold text-[#CE2E36]'>
              알림 영역 초기화 중 오류가 발생했습니다.
            </p>
            <p className='text-sm text-gray-600'>
              페이지를 새로고침한 뒤 다시 시도해주세요.
            </p>
            <button
              className='rounded-md border border-[#0055A2] px-4 py-2 text-sm font-medium text-[#0055A2] hover:bg-[#0055A2]/10'
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        }
      >
        <Suspense fallback={<></>}>
          <AuthInitializer />
          <AppRouter />
          <ToastContainer />
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
