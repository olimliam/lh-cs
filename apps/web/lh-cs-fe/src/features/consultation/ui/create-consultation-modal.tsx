import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import React, { useState } from 'react';
import { DesktopModal } from './desktop-modal';
import { TabletModal } from './tablet-modal';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

interface CreateConsultationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ConsultationFormData) => Promise<boolean>;
}

interface ConsultationFormData {
  consultationCode: string;
  tourId: string;
  facilityId: string;
}

const CreateConsultationModal: React.FC<CreateConsultationModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const toastMessages = useToastMessages();

  const [consultationCode, setConsultationCode] = useState('');
  const [tourId, setTourId] = useState<string | undefined>(undefined);
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined);

  const { isTablet } = useDeviceDetector();

  // 화면 크기에 따른 모달 변형 결정

  const handleSelectTour = (selectedTourId: string | undefined) => {
    setTourId(selectedTourId);
  };

  const handleSelectFacility = (selectedFacilityId: string | undefined) => {
    setFacilityId(selectedFacilityId);
  };

  const handleConfirm = async () => {
    if (!consultationCode) {
      console.error('상담 코드가 입력되지 않았습니다.');
      toastMessages.showConsultationCodeRequired();
      return;
    }

    if (!tourId) {
      console.error('평형이 선택되지 않았습니다.');
      toastMessages.showSelectHouseTypeRequired();
      return;
    }

    if (!facilityId) {
      console.error('유지보수 설비가 선택되지 않았습니다.');
      toastMessages.showSelectFacilityRequired();
      return;
    }

    try {
      const success = await onConfirm({
        consultationCode,
        tourId: tourId,
        facilityId: facilityId,
      });

      if (success) {
        // 폼 초기화
        setConsultationCode('');
        setFacilityId(undefined);
        setTourId(undefined);
        onClose();
      }
      // else {
      //   console.error('상담실 개설에 실패했습니다.');
      //   toastMessages.showConsultationCreateFailed();
      // }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleClose = () => {
    // 폼 초기화
    setConsultationCode('');
    setFacilityId(undefined);
    setTourId(undefined);
    onClose();
  };

  const commonProps = {
    consultationCode,
    onConsultationCodeChange: setConsultationCode,
    tourId,
    onSelectTour: handleSelectTour,
    facilityId,
    onSelectFacility: handleSelectFacility,
    onClose: handleClose,
    onConfirm: handleConfirm,
  };

  // 화면 크기에 따라 다른 모달 컴포넌트 렌더링
  if (isTablet) {
    return <TabletModal open={open} {...commonProps} />;
  }

  return <DesktopModal open={open} {...commonProps} />;
};

export default CreateConsultationModal;
