import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from './typography';
import { media } from '../utils';

// 기본 Pretendard 폰트 스타일
export const basePretendardStyle = `
  font-family: ${BASE_FONT_FAMILY};
  line-height: 1.3;
`;

// 공통 텍스트 스타일 컴포넌트들
export const HeadingLarge = styled.div`
  ${basePretendardStyle}
  font-weight: 700;
  font-size: 18px;
  color: #111111;
  white-space: nowrap;
`;

export const BodyMedium = styled.div`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 14px;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BodySmall = styled.div`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 12px;
  color: #ffffff;
`;

export const ButtonText = styled.span`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 14px;
  color: #ffffff;
`;

// 변형 스타일들
export const BodyMediumDark = styled(BodyMedium)`
  color: #111111;
`;

export const BodyMediumGray = styled(BodyMedium)`
  color: #666666;
`;

// LNB용 스타일들
export const SectionTitle = styled.div`
  ${basePretendardStyle}
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: #111111;

  ${media.tablet`
    font-size: 16px;
  `}
`;

export const MenuItemText = styled.div<{ isSelected?: boolean }>`
  ${basePretendardStyle}
  font-weight: ${(props) => (props.isSelected ? 600 : 500)};
  font-size: 16px;
  line-height: 24px;
  color: ${(props) => (props.isSelected ? '#111111' : 'rgba(17, 17, 17, 0.8)')};
  flex: 1;
`;

export const BodyLarge = styled.div`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #111111;
`;

// GNB용 스타일들
export const GNBMainTitle = styled.div`
  ${basePretendardStyle}
  font-weight: 700;
  font-size: 16px;
  color: #333333;
`;

export const GNBSubTitle = styled.div`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 14px;
  color: #666666;
`;

export const GNBButtonText = styled.span`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
`;

// Modal용 스타일들
export const ModalTitle = styled.div`
  ${basePretendardStyle}
  font-weight: 600;
  font-size: 18px;
  color: #333333;
`;

export const ModalMessage = styled.div`
  ${basePretendardStyle}
  font-weight: 400;
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
`;

export const ModalButtonText = styled.span`
  ${basePretendardStyle}
  font-weight: 500;
  font-size: 14px;
`;
