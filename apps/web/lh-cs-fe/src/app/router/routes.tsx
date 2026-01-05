import { LoginPage } from '@/pages/login';
import { VerifySmsPage } from '@/pages/verify-sms';
import { ChangePasswordPage } from '@/pages/change-password';
import { RegisterPage } from '@/pages/register';
import { TourPage } from '@/pages/tour/ui/tour-page';
import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';
import { MainLayout } from '../layout';
import { WebRTCHostPage, WebRTCVisitorPage } from '@/pages';
import ConsultationManagePage from '@/pages/admin/ui/consultation';
import AdminLayout from '@/pages/admin/ui/layout';
import { SamplePage } from '@/pages/sample/sample-page';
import { TourLayout } from '@/pages/tour/ui/layout';
import { VisitorTourPage } from '@/pages/visitor-tour';
import { AuthGuard, ServiceUrlProvider } from '../providers';
// import { TourAuthGuard } from '../providers/tour-auth-guard';
import { SelfCheckSelectorPage } from '@/pages/self-check/ui/self-check-selector-page';
import { SelfCheckTourPage } from '@/pages/self-check/ui/self-check-tour-page';
import SelfCheckLayout from '@/pages/self-check/ui/self-check-layout';
import { LandingPage } from '@/pages/landing/ui/landing-page';
import { VisitorTourLayout } from '@/pages/visitor-tour/ui/layout';
import ManagementLayout from '@/pages/management/layout';
import UsersApprovalPage from '@/pages/management/ui/users-approval';
import UsersListPage from '@/pages/management/ui/users-list';
import ManageNoticePage from '@/pages/management/ui/notice';
import ManageQnaPage from '@/pages/management/ui/qna';
import IpListPage from '@/pages/management/ui/ip-list';

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-sms',
    element: (
      <AuthGuard>
        <VerifySmsPage />
      </AuthGuard>
    ),
  },
  {
    path: '/change-password-required',
    element: (
      <AuthGuard>
        <ChangePasswordPage />
      </AuthGuard>
    ),
  },
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to='/admin/consultation' replace /> },
      { path: 'consultation', element: <ConsultationManagePage /> },
      // { path: 'vision-ai', element: <VisionAiIntegrationPage /> },
      {
        path: 'host/:consultationId',
        element: <WebRTCHostPage />,
      },
    ],
  },
  {
    path: '/management',
    element: (
      <AuthGuard>
        <ManagementLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to='/management/users' replace /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'users-approval', element: <UsersApprovalPage /> },
      { path: 'notice', element: <ManageNoticePage /> },
      { path: 'qna', element: <ManageQnaPage /> },
      { path: 'ip-list', element: <IpListPage /> },
    ],
  },
  {
    path: '/tour',
    element: (
      // <TourAuthGuard>
      <TourLayout />
      // </TourAuthGuard>
    ),
    children: [{ path: ':consultationId', element: <TourPage /> }],
  },
  {
    path: '/visitor-tour',
    element: <VisitorTourLayout />,
    children: [{ path: ':consultationId', element: <VisitorTourPage /> }],
  },
  {
    path: '/visitor/:consultationId',
    element: <WebRTCVisitorPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to='/landing' replace /> },
      { path: '*', element: <Navigate to='/landing' replace /> },
    ],
  },
  {
    path: '/sample',
    element: <SamplePage />,
  },
  {
    path: '/self-check',
    element: <SelfCheckLayout />,
    children: [
      { index: true, element: <SelfCheckSelectorPage /> },
      { path: 'tour', element: <SelfCheckTourPage /> },
    ],
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
];

const router = createBrowserRouter(routes);

export const AppRouter = () => (
  <ServiceUrlProvider>
    <RouterProvider router={router} />
  </ServiceUrlProvider>
);
