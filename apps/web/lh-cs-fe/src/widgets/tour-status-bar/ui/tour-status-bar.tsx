import React from 'react';
import styled from '@emotion/styled';
import type { TourStatusBarProps } from '../model/tour-status-bar.types';
import { getConsultationStatusText } from '../model/tour-status-bar.types';
import { BASE_FONT_FAMILY } from '@/shared/ui';
import { PersonIcon } from '@/shared/ui/icons/person-icon';
import { ConnectedIcon } from '@/shared/ui/icons/connected-icon';
import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';
import { getConsultationStatusColor } from '@/shared/utils/consultation-status-colors';

// 오버레이 스타일을 styled-components로 분리
export const StatusBarOverlay = styled.div<{ statusColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px 8px 12px;
  gap: 6px;

  border-radius: 20px;
  border: 1px solid ${(props) => props.statusColor};
  background: rgba(255, 255, 255, 0.6);

  position: fixed;
  left: 50%;
  top: 80px;
  height: 36px;
  z-index: 1250;
  border-radius: 20px;
  transform: translateX(-50%);
  font-family: ${BASE_FONT_FAMILY};
`;

export const SyncButton = styled.button`
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #cccccc;
  color: #333333;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
  &:hover {
    background: #bbf7d0;
  }
`;

const TourStatusBar: React.FC<TourStatusBarProps> = ({
  consultationStatus = ConsultationStatusEnum.CONSULTING,
  className,
}) => {
  // consultationStatus가 ConsultationStatusEnum인지 확인하고 기본값 설정
  const statusColor = Object.values(ConsultationStatusEnum).includes(
    consultationStatus as ConsultationStatusEnum
  )
    ? getConsultationStatusColor(consultationStatus as ConsultationStatusEnum)
    : '#90c31f'; // 기본값

  return (
    <StatusBarOverlay
      className={className}
      data-node-id='tour-status-bar-overlay'
      statusColor={statusColor}
    >
      {/* 접속 상태 뱃지 */}
      <div
        style={{ background: statusColor }}
        className='flex items-center justify-center gap-[4px] rounded-[20px] py-[2px] pl-[8px] pr-[6px]'
      >
        <span
          style={{
            fontWeight: 700,
            color: '#fff',
            fontSize: 12,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
          }}
        >
          접속 상태
        </span>

        <div className='text-white'>
          <ConnectedIcon width={12} height={10} />
        </div>
      </div>
      <div
        style={{ background: '#999999', height: 14, width: 1, margin: '0 8px' }}
      />
      {/* 상담 상태 */}
      <div className='flex items-center gap-[8px]'>
        <div className='text-[#333333]'>
          <PersonIcon width={12} height={12} />
        </div>

        <span
          style={{
            fontWeight: 700,
            color: '#666',
            fontSize: 14,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
          }}
        >
          {getConsultationStatusText(consultationStatus)}
        </span>
      </div>
    </StatusBarOverlay>
  );
};

export default TourStatusBar;
