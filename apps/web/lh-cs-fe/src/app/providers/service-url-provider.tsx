import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';

const trimTrailingSlash = (value?: string | null) => {
  if (!value) return '';
  return value.trim().replace(/\/+$/, '');
};

const isNumericIp = (value: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(value);

const calculateServiceUrl = (): string => {
  const selfUrl = trimTrailingSlash(import.meta.env.VITE_SELF_URL);

  if (typeof window === 'undefined') {
    return selfUrl;
  }

  const { hostname, origin } = window.location;
  if (hostname && isNumericIp(hostname) && selfUrl) {
    return selfUrl;
  }

  return selfUrl || origin || '';
};

const ServiceUrlContext = createContext<string>('');

interface ServiceUrlProviderProps {
  children: ReactNode;
}

export const ServiceUrlProvider = ({ children }: ServiceUrlProviderProps) => {
  const serviceUrl = useMemo(() => calculateServiceUrl(), []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { hostname } = window.location;
    if (!hostname || !isNumericIp(hostname) || !serviceUrl) return;

    const absoluteUrl = serviceUrl.match(/^https?:\/\//i)
      ? serviceUrl
      : `${window.location.protocol}//${window.location.host}${serviceUrl}`;

    if (absoluteUrl === window.location.href) return;

    window.location.replace(absoluteUrl);
  }, [serviceUrl]);

  return (
    <ServiceUrlContext.Provider value={serviceUrl}>
      {children}
    </ServiceUrlContext.Provider>
  );
};

export const useServiceUrl = () => {
  return useContext(ServiceUrlContext);
};
