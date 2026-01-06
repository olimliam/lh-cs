import { useMemo } from 'react';
import { resolveClientDevice } from '@/shared/lib/utils/client-metadata';

interface UseClientMetadataResult {
  device?: string;
  ipAddress?: string;
  isIpLoading: boolean;
}

/**
 * 디바이스(User-Agent)를 조회합니다. IP는 서버에서 직접 기록합니다.
 */
export const useClientMetadata = (): UseClientMetadataResult => {
  const device = useMemo(() => resolveClientDevice(), []);

  return {
    device,
    ipAddress: undefined,
    isIpLoading: false,
  };
};
