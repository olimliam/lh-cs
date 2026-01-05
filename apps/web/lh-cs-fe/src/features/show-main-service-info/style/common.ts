import { media } from '@/shared/utils';
import styled from '@emotion/styled';

export const StyledModalContentHeader = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;

  ${media.tablet`
    gap: 12px;
    justify-content: space-between;
  `}
`;
export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
`;

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  ${media.tablet`
    gap: 12px;
  `}
`;

export const IconContainer = styled.div<{ bgColor?: string }>`
  background-color: ${(props) => props.bgColor || 'none'};
  border-radius: 100%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    width: 48px;
    height: 48px;
  `}
`;
// 텍스트 영역
export const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: center;
  width: calc(100% - 80px);
  line-height: 1.3;
`;

// 메인 타이틀
export const MainTitle = styled.p<{ fontSize?: number; color?: string }>`
  font-weight: 700;
  font-size: ${({ fontSize }) => fontSize || 20}px;
  color: ${(props) => props.color || '#111'};
  text-align: center;
  margin: 0;
  word-break: keep-all;
  ${media.tablet`
    font-size: 16px;
    margin-bottom: 0;
  `}
`;

// 서브 타이틀
export const SubTitle = styled.p`
  font-weight: 500;
  font-size: 16px;
  color: #333333;
  margin: 0;
  word-break: keep-all;
  ${media.tablet`
    gap: 4px;
    font-size: 14px;
  `}
`;
