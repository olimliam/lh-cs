import { useEffect } from 'react';

function useViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${height}px`);
    };

    setViewportHeight();

    window.visualViewport?.addEventListener('resize', setViewportHeight);
    window.addEventListener('resize', setViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('resize', setViewportHeight);
    };
  }, []);
}

export default useViewportHeight;
