import { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const modalRoot = document.getElementById('modal-root') || document.body;

  useEffect(() => {
    // 모달이 열렸을 때 body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return ReactDOM.createPortal(children, modalRoot);
};
