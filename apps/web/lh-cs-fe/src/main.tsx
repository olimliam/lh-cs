import { ToolbarProvider, ViewerProvider } from '@packages/traveler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './app.tsx';
import './app/styles/index.css';
// import { BrowserRouter } from 'react-router';
import { checkAndHandleUnauthorizedError } from './features/auth/lib/logout-handler';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: (failureCount, error) => {
        // 401 에러인 경우 즉시 로그아웃 처리하고 재시도하지 않음
        if (checkAndHandleUnauthorizedError(error, queryClient, 'Global Query Error Handler')) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // 401 에러인 경우 즉시 로그아웃 처리하고 재시도하지 않음
        if (checkAndHandleUnauthorizedError(error, queryClient, 'Global Mutation Error Handler')) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  // <BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <ViewerProvider>
      <ToolbarProvider>
        <App />
      </ToolbarProvider>
    </ViewerProvider>
  </QueryClientProvider>
  // </BrowserRouter>
);
