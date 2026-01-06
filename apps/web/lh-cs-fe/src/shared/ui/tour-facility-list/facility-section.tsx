import React from 'react';
import styled from '@emotion/styled';
import { media } from '@/shared/utils';

const StyledFacilityTitle = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
  padding: 10px 12px;

  ${media.tablet`
    font-size: 16px;
    padding: 6px 10px;
  `}
`;

interface FacilitySectionProps {
  title: string;
  backgroundColor: string;
  textColor: string;
  items: Array<{ id: string; facilityTitle: string }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  selectedBgColor: string;
  numberBgColor: string;
  numberTextColor: string;
  selectedBorderColor: string;
  selectedCheckmarkBg: string;
  roundedClass?: string;
}

export const FacilitySection: React.FC<FacilitySectionProps> = ({
  title,
  backgroundColor,
  textColor,
  items,
  selectedId,
  onSelect,
  selectedBgColor,
  numberBgColor,
  numberTextColor,
  selectedBorderColor,
  selectedCheckmarkBg,
  roundedClass = '',
}) => {
  return (
    <div className={`flex-1 ${roundedClass}`}>
      <StyledFacilityTitle style={{ backgroundColor }}>
        {title}{' '}
        <span
          className={`ml-2 rounded-[4px] bg-[rgba(255,255,255,0.4)] px-1.5 text-[16px] font-semibold`}
          style={{ color: textColor }}
        >
          {items.length}
        </span>
      </StyledFacilityTitle>
      <div className='flex flex-col bg-white'>
        {items.map((option, idx) => (
          <button
            key={option.id}
            type='button'
            onClick={() => onSelect(option.id)}
            className={`flex items-center justify-between border-b border-[#eeeeee] px-3 py-2.5 last:border-b-0 ${selectedId === option.id ? selectedBgColor : ''}`}
          >
            <span
              className={`mr-2 flex h-4 w-4 items-center justify-center rounded-[2px] text-[12px] font-bold`}
              style={{ backgroundColor: numberBgColor, color: numberTextColor }}
            >
              {idx + 1}
            </span>
            <span className='text-[16px] font-medium text-[#111111]'>
              {option.facilityTitle}
            </span>
            <span
              className={`inline-block h-5 w-5 rounded-full border ${selectedId === option.id ? selectedBorderColor : 'border-[#b3b3b3]'} ml-2 flex items-center justify-center`}
              style={
                selectedId === option.id
                  ? {
                      backgroundColor: selectedCheckmarkBg,
                      borderColor: selectedCheckmarkBg,
                    }
                  : {}
              }
            >
              {selectedId === option.id ? (
                <span className='text-[16px] text-white'>✓</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
