import styled from '@emotion/styled';

// 기본 폰트 패밀리
export const BASE_FONT_FAMILY =
  "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// 기본 텍스트 스타일
export const BaseText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  line-height: 1.5;
  color: #111111;
  margin: 0;
`;

// 헤더 타이포그래피
export const HeaderTitle = styled(BaseText)`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: #111111;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const HeaderSubtitle = styled(BaseText)`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3;
  color: #666666;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

// 브랜드 타이포그래피 (기존 GNB 스타일과 호환)
export const BrandMainTitle = styled(HeaderTitle)`
  font-weight: 700;
  color: #111111;
`;

export const BrandSubTitle = styled(HeaderSubtitle)`
  font-weight: 500;
  color: #666666;
`;

// 버튼 텍스트
export const ButtonText = styled(BaseText)`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

// 상태 텍스트
export const StatusText = styled(BaseText)`
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
`;

// 라벨 텍스트
export const LabelText = styled(BaseText)`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: #666666;
`;

// 사용자 정보 텍스트
export const UserNameText = styled(BaseText)`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: #111111;
`;

export const UserRoleText = styled(BaseText)`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: #666666;
`;

// 컬러 변형들
export const PrimaryText = styled(BaseText)`
  color: #0055a2;
`;

export const SuccessText = styled(BaseText)`
  color: #5b771e;
`;

export const WarningText = styled(BaseText)`
  color: #e65100;
`;

export const ErrorText = styled(BaseText)`
  color: #ce2e36;
`;

export const MutedText = styled(BaseText)`
  color: #999999;
`;

// 반응형 유틸리티
export const HideOnMobile = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const ShowOnMobile = styled.span`
  display: none;

  @media (max-width: 768px) {
    display: inline;
  }
`;

// 텍스트 오버플로우 처리
export const TruncatedText = styled(BaseText)`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    max-width: 120px;
  }
`;
