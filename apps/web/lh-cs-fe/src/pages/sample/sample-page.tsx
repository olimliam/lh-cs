import React, { useState } from 'react';
import { Box, Divider } from '@mui/material';
import styled from '@emotion/styled';
import { ConsultationHeader } from './components/consultation-header';
import { FloorPlanSelector } from './components/floor-plan-selector';
import { ViewerArea } from './components/viewer-area';
import { MaintenanceCategoryData } from './components/maintenance-category-section';

const PageContainer = styled(Box)`
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled(Box)`
  position: relative;
  display: flex;
  height: 860px;
  max-height: 860px;
  width: 1400px;
  max-width: 1400px;
  flex-direction: column;
  gap: 20px;
  border-radius: 8px;
  background-color: #f5f5f5;
  padding: 24px;
  box-shadow:
    0 24px 38px 3px rgba(0, 0, 0, 0.14),
    0 9px 46px 8px rgba(0, 0, 0, 0.12),
    0 11px 15px -7px rgba(0, 0, 0, 0.2);
`;

const ContentContainer = styled(Box)`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

// 샘플 데이터
const MAINTENANCE_CATEGORIES: MaintenanceCategoryData[] = [
  {
    id: 'architecture',
    title: '건축',
    color: '#A38644',
    options: [
      {
        id: 'arch-1',
        number: 1,
        title: '외벽 및 외장재 점검',
        category: 'architecture',
      },
      {
        id: 'arch-2',
        number: 2,
        title: '지붕 및 방수 점검',
        category: 'architecture',
      },
      {
        id: 'arch-3',
        number: 3,
        title: '내부 마감재 점검',
        category: 'architecture',
      },
      {
        id: 'arch-4',
        number: 4,
        title: '구조체 안전 점검',
        category: 'architecture',
      },
      {
        id: 'arch-5',
        number: 5,
        title: '창호 및 문 점검',
        category: 'architecture',
      },
      {
        id: 'arch-6',
        number: 6,
        title: '계단 및 난간 점검',
        category: 'architecture',
      },
    ],
  },
  {
    id: 'mechanical',
    title: '기계',
    color: '#90B25D',
    options: [
      {
        id: 'mech-1',
        number: 1,
        title: '급수 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-2',
        number: 2,
        title: '배수 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-3',
        number: 3,
        title: '환기 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-4',
        number: 4,
        title: '냉난방 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-5',
        number: 5,
        title: '승강기 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-6',
        number: 6,
        title: '소방 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-7',
        number: 7,
        title: '가스 시설 점검',
        category: 'mechanical',
      },
      {
        id: 'mech-8',
        number: 8,
        title: '보일러 시설 점검',
        category: 'mechanical',
      },
    ],
  },
  {
    id: 'electrical',
    title: '전기·통신',
    color: '#446AA3',
    options: [
      {
        id: 'elec-1',
        number: 1,
        title: '전기 배선 점검',
        category: 'electrical',
      },
      { id: 'elec-2', number: 2, title: '분전반 점검', category: 'electrical' },
      {
        id: 'elec-3',
        number: 3,
        title: '조명 시설 점검',
        category: 'electrical',
      },
      {
        id: 'elec-4',
        number: 4,
        title: '콘센트 및 스위치 점검',
        category: 'electrical',
      },
      {
        id: 'elec-5',
        number: 5,
        title: '통신 설비 점검',
        category: 'electrical',
      },
      {
        id: 'elec-6',
        number: 6,
        title: '인터넷 및 전화 점검',
        category: 'electrical',
      },
      {
        id: 'elec-7',
        number: 7,
        title: '보안 시설 점검',
        category: 'electrical',
      },
      {
        id: 'elec-8',
        number: 8,
        title: 'CCTV 시설 점검',
        category: 'electrical',
      },
      {
        id: 'elec-9',
        number: 9,
        title: '비상 전력 시설 점검',
        category: 'electrical',
      },
      {
        id: 'elec-10',
        number: 10,
        title: '접지 시설 점검',
        category: 'electrical',
      },
      {
        id: 'elec-11',
        number: 11,
        title: '피뢰침 점검',
        category: 'electrical',
      },
      {
        id: 'elec-12',
        number: 12,
        title: '전기 안전 점검',
        category: 'electrical',
      },
      {
        id: 'elec-13',
        number: 13,
        title: '통신망 점검',
        category: 'electrical',
      },
      {
        id: 'elec-14',
        number: 14,
        title: '방송 시설 점검',
        category: 'electrical',
      },
    ],
  },
];

interface FloorPlan {
  id: string;
  area: string;
  image?: string;
}

export const SamplePage: React.FC = () => {
  const [consultationCode, setConsultationCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const floorPlans: FloorPlan[] = [
    { id: '21', area: '21㎡' },
    { id: '25', area: '25㎡' },
    { id: '29', area: '29㎡' },
    { id: '33', area: '33㎡' },
    { id: '39', area: '39㎡' },
    { id: '42', area: '42㎡' },
    { id: '46', area: '46㎡' },
    { id: '50', area: '50㎡' },
  ];

  const handleConsultationCodeChange = (value: string) => {
    setConsultationCode(value);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleClose = () => {
    // TODO: Implement close functionality
    console.log('Close modal');
  };

  return (
    <PageContainer>
      <ModalContainer>
        <ConsultationHeader
          consultationCode={consultationCode}
          onConsultationCodeChange={handleConsultationCodeChange}
          onClose={handleClose}
        />

        <Divider sx={{ backgroundColor: '#e0e0e0' }} />

        <ContentContainer>
          <FloorPlanSelector
            floorPlans={floorPlans}
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />

          <ViewerArea selectedPlan={MAINTENANCE_CATEGORIES} />
        </ContentContainer>
      </ModalContainer>
    </PageContainer>
  );
};
