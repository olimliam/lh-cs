import React from 'react';
import {
  BaseHeaderContainer,
  FixedHeaderContainer,
  HeaderLeftSection,
  HeaderRightSection,
  HeaderCenterSection,
  LogoContainer,
  LogoImage,
  LogoText,
} from './header.styles';
import { BrandMainTitle, BrandSubTitle } from '../typography/typography.styles';

export interface BaseHeaderProps {
  children?: React.ReactNode;
  fixed?: boolean;
  className?: string;
}

export interface HeaderLogoProps {
  logoSrc?: string;
  logoAlt?: string;
  mainTitle?: string;
  subTitle?: string;
  onClick?: () => void;
}

export interface HeaderSectionProps {
  children: React.ReactNode;
  className?: string;
}

// 기본 헤더 컨테이너
export const BaseHeader: React.FC<BaseHeaderProps> = ({
  children,
  fixed = false,
  className,
}) => {
  const Container = fixed ? FixedHeaderContainer : BaseHeaderContainer;

  return <Container className={className}>{children}</Container>;
};

// 헤더 로고 컴포넌트
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  logoSrc = '/logo/lh-brand-logo.svg',
  logoAlt = 'LH Logo',
  mainTitle,
  subTitle,
  onClick,
}) => {
  return (
    <LogoContainer
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <LogoImage src={logoSrc} alt={logoAlt} />
      {(mainTitle || subTitle) && (
        <LogoText>
          {mainTitle && <BrandMainTitle>{mainTitle}</BrandMainTitle>}
          {subTitle && <BrandSubTitle>{subTitle}</BrandSubTitle>}
        </LogoText>
      )}
    </LogoContainer>
  );
};

// 헤더 섹션 컴포넌트들
export const HeaderLeft: React.FC<HeaderSectionProps> = ({
  children,
  className,
}) => <HeaderLeftSection className={className}>{children}</HeaderLeftSection>;

export const HeaderRight: React.FC<HeaderSectionProps> = ({
  children,
  className,
}) => <HeaderRightSection className={className}>{children}</HeaderRightSection>;

export const HeaderCenter: React.FC<HeaderSectionProps> = ({
  children,
  className,
}) => (
  <HeaderCenterSection className={className}>{children}</HeaderCenterSection>
);

// 기본 GNB 호환 컴포넌트 (기존 코드와의 호환성을 위해)
export interface LegacyGNBProps {
  mainTitle?: string;
  subTitle?: string;
  logoSrc?: string;
  children?: React.ReactNode;
  fixed?: boolean;
  className?: string;
}

export const LegacyGNBContainer: React.FC<LegacyGNBProps> = ({
  mainTitle = '관리자 페이지',
  subTitle = '3D 가상현실 기반 유지 보수 서비스',
  logoSrc,
  children,
  fixed = false,
  className,
}) => {
  return (
    <BaseHeader fixed={fixed} className={className}>
      <HeaderLeft>
        <HeaderLogo
          logoSrc={logoSrc}
          mainTitle={mainTitle}
          subTitle={subTitle}
        />
      </HeaderLeft>

      <HeaderRight>{children}</HeaderRight>
    </BaseHeader>
  );
};
