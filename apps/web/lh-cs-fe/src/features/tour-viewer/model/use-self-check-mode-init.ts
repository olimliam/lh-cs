import { useEffect } from 'react';

const SELF_CHECK_PATH_SEGMENT = '/self-check/tour';

export const useSelfCheckModeInit = (
  pathname: string,
  setIsSelfCheckMode: (value: boolean) => void
) => {
  useEffect(() => {
    setIsSelfCheckMode(pathname.includes(SELF_CHECK_PATH_SEGMENT));
  }, [pathname, setIsSelfCheckMode]);
};

