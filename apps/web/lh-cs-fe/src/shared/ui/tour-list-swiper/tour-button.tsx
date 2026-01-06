import React from 'react';

import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '@/shared/ui';
import { TourResponse } from '@/shared/model/tour.dto';
import { media } from '@/shared/utils';

interface TourButtonProps {
  currentTourId: string;
  option: TourResponse;
  size?: 'sm' | 'lg';
  onClick: (tourId: string | undefined, squareMeter: number) => void;
}

interface RadioIconProps {
  selected: boolean;
}
const RadioIcon = styled('span')<RadioIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  /* height: 24px;
  width: 24px; */
  border-radius: 50%;
  border: 1px solid #fff;
  background: ${({ selected }) =>
    selected ? 'rgba(248, 252, 255, 0.40)' : 'transparent'};
  transition:
    background 0.2s,
    border-color 0.2s;

  /* ${media.tablet`
    height: 20px;
    width: 20px;
  `} */
`;

const ButtonTitle = styled.div`
  color: #fff;

  text-align: center;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%; /* 20.8px */
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: calc(100% - 47px);
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${media.tablet`
    height: calc(100% - 42px);
  `}
`;

const ButtonHeader = styled.div`
  display: flex;
  padding: 6px 10px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  background: #999;
  width: 100%;
  /* height: 46px;
  font-size: 24px; */

  /* ${media.tablet`
    height: 42px;
    font-size: 20px;
  `} */
`;

interface StyledButtonProps {
  selected: boolean;
  size?: 'sm' | 'lg';
}
const StyledButton = styled('button')<StyledButtonProps>`
  background: ${({ selected }) =>
    selected ? '#F8FCFF' : 'rgba(153, 153, 153, 0.2)'};
  border-radius: 8px;
  /* width: 196px;
  height: 179px; */
  overflow: hidden;
  transition: background 0.2s;

  & ${ButtonHeader} {
    background: ${({ selected }) => (selected ? '#0055A2' : '#999')};
  }

  ${({ size }) =>
    size === 'lg'
      ? `
    width: 196px;
    height: 179px;

    & ${ButtonHeader} {
      height: 46px;
      font-size: 24px;
    }
    & ${RadioIcon} {
      width: 24px;
      height: 24px;
    }
    & ${ImageWrapper} {
      height: calc(100% - 46px);
    }
  `
      : `
    width: 126px;
    height: 125px;

    & ${RadioIcon} {
      width: 16px;
      height: 16px;
    }

    & ${ButtonHeader} {
      height: 32px;
      font-size: 16px;
    }
    & ${ImageWrapper} {
      height: calc(100% - 32px);
    }
  `}

  @media screen and (min-width: 1025px) {
    ${({ selected }) =>
      !selected &&
      `
      &:hover {
        background: rgba(153, 153, 153, 0.4);
        & ${ButtonHeader} {
          background: #666;
        }
      }
    `}
  }

  @media screen and (max-width: 1024px) {
    ${({ size }) =>
      size === 'lg'
        ? `
      width: 152px;
      height: 154px;

      & ${ButtonHeader} {
        height: 42px;
        font-size: 20px;
      }
      & ${RadioIcon} {
        width: 20px;
        height: 20px;
      }
      & ${ImageWrapper} {
        height: calc(100% - 42px);
      }
    `
        : `
      width: 126px;
      height: 125px;

      & ${ButtonHeader} {
        height: 32px;
        font-size: 16px;
      }
      & ${ImageWrapper} {
        height: calc(100% - 32px);
      }
    `}
  }

  /* ${media.tablet`
    width: 152px;
    height: 154px;
  `} */
`;
// const cdnUrl = import.meta.env.VITE_AWS_CDN_BUCKET_PREFIX;
export const TourButton: React.FC<TourButtonProps> = ({
  currentTourId,
  option,
  size,
  onClick,
}) => {
  const isSelected = currentTourId === option.id;
  return (
    <StyledButton
      type='button'
      size={size}
      selected={isSelected}
      onClick={() => onClick(option.id, option.squareMeters)}
    >
      <ButtonHeader>
        <ButtonTitle>{option.squareMeters}m2</ButtonTitle>
        <RadioIcon selected={isSelected}>
          {isSelected ? (
            <span
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#fff',
                borderRadius: '100%',
              }}
            ></span>
          ) : null}
        </RadioIcon>
      </ButtonHeader>
      <ImageWrapper>
        <img src={option.imageUrl} alt={option.title} />
      </ImageWrapper>
    </StyledButton>
  );
};
