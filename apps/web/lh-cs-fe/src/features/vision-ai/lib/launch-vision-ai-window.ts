import { api } from '@/shared/api/api-client';

interface MintVisionAiEptResponse {
  success: boolean;
  data?: {
    eptToken: string;
    expiresIn: number;
    audience: string;
    origin: string;
  };
  message?: string;
}

interface LaunchVisionAiWindowResult {
  url: string;
  token: string;
  windowRef: Window;
}

const resolveChildOrigin = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return (
    import.meta.env.VITE_VISION_AI_CHILD_ORIGIN ?? window.location.origin ?? ''
  );
};

const resolveChildPath = () =>
  import.meta.env.VITE_VISION_AI_CHILD_PATH ?? '/iframe-sample/index.html';

export const launchVisionAiWindow =
  async (): Promise<LaunchVisionAiWindowResult> => {
    if (typeof window === 'undefined') {
      throw new Error('브라우저 환경에서만 비전 AI 창을 열 수 있습니다.');
    }

    const response = await api.post<MintVisionAiEptResponse>(
      '/external/v1/vision-ai/mint-ept'
    );
    const payload = response.data;
    const token = payload?.data?.eptToken;

    if (!payload?.success || !token) {
      throw new Error(payload?.message ?? 'EPT 발급 응답이 올바르지 않습니다.');
    }

    const childOrigin = resolveChildOrigin();
    if (!childOrigin) {
      throw new Error('비전 AI Child Origin이 설정되지 않았습니다.');
    }

    const childPath = resolveChildPath();
    const url = new URL(childPath, childOrigin);
    url.searchParams.set('eptToken', token);

    const windowRef = window.open(url.toString(), '_blank', 'noopener');

    if (!windowRef) {
      throw new Error(
        '비전 AI 창을 열 수 없습니다. 팝업 차단 설정을 확인해 주세요.'
      );
    }

    return { url: url.toString(), token, windowRef };
  };
