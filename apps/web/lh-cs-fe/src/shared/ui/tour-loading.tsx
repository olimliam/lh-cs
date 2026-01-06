import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Spinner from '@/shared/ui/spinner';

function TourLoading() {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return ReactDOM.createPortal(
    <div className='fixed left-[50%] top-[50%] z-50 flex h-screen w-screen translate-x-[-50%] translate-y-[-50%] items-center justify-center'>
      <Spinner />
    </div>,
    document.body
  );
}

export default TourLoading;
