/**
 * 브라우저에서 User-Agent 문자열을 안전하게 반환합니다.
 */
export const resolveClientDevice = () => {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.userAgent;
};

/**
 * 서버에서 IP를 로그로 관리하므로 프런트엔드에서는 값을 조회하지 않습니다.
 */
export const fetchPublicIpAddress = async (): Promise<string | undefined> =>
  undefined;

export const getCachedIpAddress = () => undefined;
export const resetIpCache = () => undefined;

export const clientMetadataUtils = {
  resolveClientDevice,
  fetchPublicIpAddress,
  getCachedIpAddress,
  resetIpCache,
};
