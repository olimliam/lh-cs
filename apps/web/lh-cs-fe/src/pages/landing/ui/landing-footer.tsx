import { media } from '@/shared/utils';
import styled from '@emotion/styled';

const StyledFooterWrapper = styled.footer`
  display: flex;
  padding: 16px 120px;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e2e2;
  background: #f9fbff;

  ${media.tablet`
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  `}
  ${media.fold`
    padding: 16px;
  `}
`;
const StyledFooterLogo = styled.img`
  width: 106px;
  ${media.tablet`
    width: 92px;
  `}
`;
const StyledFooterTextWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding-bottom: 4px;

  ${media.fold`
    flex-direction: column;
    gap: 4px;
  `}
`;
const StyleFooterText = styled.p<{ $fontWeight: number; $fontSize: number }>`
  color: #666;
  font-style: normal;
  line-height: 130%;
  font-size: ${({ $fontSize }) => $fontSize}px;
  font-weight: ${({ $fontWeight }) => $fontWeight};
  ${media.tablet`
    font-size: 12px;
  `}
`;

export const LandingFooter: React.FC = () => (
  <StyledFooterWrapper id='landingFooter'>
    <div>
      <StyledFooterLogo src='/logo/lh-footer-logo.svg' alt='한국토지주택공사' />
    </div>
    <div className='text-left'>
      <StyledFooterTextWrapper>
        <StyleFooterText $fontWeight={500} $fontSize={14}>
          {`우) 52852 경상남도 진주시 충의로 19(충무공동)`}
        </StyleFooterText>
        <StyleFooterText $fontWeight={500} $fontSize={14}>
          대표번호 : 1600-1004
        </StyleFooterText>
        <StyleFooterText $fontWeight={500} $fontSize={14}>
          FAX : 055-922-5959(문서과)
        </StyleFooterText>
      </StyledFooterTextWrapper>

      <StyleFooterText $fontSize={12} $fontWeight={400}>
        COPYRIGHT 2023 BY KOREA LAND & HOUSING CORPORATION. ALL RIGHTS RESERVED
      </StyleFooterText>
    </div>
  </StyledFooterWrapper>
);
