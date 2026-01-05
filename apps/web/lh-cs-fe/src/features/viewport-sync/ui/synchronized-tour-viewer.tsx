import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useViewportSyncStore } from '../model/viewport-sync.store';

// Styled Components following Figma design (node-id=1068-68042)
const ViewerContainer = styled(Box)`
  background: #eee;
  position: relative;
  overflow: hidden;
  border: 3px dashed #1d1d1dff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(110, 111, 112, 0.3);

  /* 기본 비율 (동기화 전) */
  aspect-ratio: 16 / 9;

  /* 컨테이너 크기 제한 - 부모 컨테이너 안에서 조정 */
  max-width: 100%;
  max-height: 100%;

  /* 중앙 정렬을 위한 설정 */
  margin: 0 auto;

  /* 동기화 시 JavaScript에서 동적으로 설정 */
  transition: all 0.3s ease-in-out;

  /* 테스트 모드일 때 다른 색상 */
  &[data-test-mode='true'] {
    border-color: #ff6b00;
    box-shadow: 0 0 10px rgba(255, 107, 0, 0.3);
  }
`;

const ViewerContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderText = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-weight: 500;
  color: #666666;
  text-align: center;
`;

const DeviceTypeIndicator = styled(Box)`
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border-radius: 6px;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 11px;
  font-weight: 500;
  z-index: 10;
  max-width: calc(100% - 120px); /* 오른쪽 selector 공간 확보 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: fit-content; /* 컨텐츠 크기에 맞게 조정 */

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 4px 8px;
    max-width: calc(100% - 80px);
  }
`;

const AspectRatioSelector = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
`;

const Select = styled.select`
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 12px;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }

  option {
    background-color: #000000;
    color: #ffffff;
  }
`;

interface SynchronizedTourViewerProps {
  children?: React.ReactNode;
  className?: string;
}

// 기본 16:9 비율은 테스트/자동 모드 모두에서 fallback 으로 사용한다.
const DEFAULT_ASPECT_RATIO = 16 / 9;

// eval 대신 안전하게 문자열 비율(16/9, 1.77 등)을 숫자로 변환한다.
const parseAspectRatio = (value: string): number | null => {
  if (!value || value === 'auto') {
    return null;
  }

  const sanitized = value.replace(/\s+/g, '');
  if (sanitized.includes('/')) {
    const [numerator, denominator] = sanitized.split('/');
    const top = Number(numerator);
    const bottom = Number(denominator);

    if (Number.isFinite(top) && Number.isFinite(bottom) && bottom !== 0) {
      return top / bottom;
    }
    return null;
  }

  const numeric = Number(sanitized);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const SynchronizedTourViewer: React.FC<SynchronizedTourViewerProps> = ({
  children,
  className,
}) => {
  const { currentViewport, adminSyncEnabled } = useViewportSyncStore();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [testAspectRatio, setTestAspectRatio] = useState<string>('auto');

  // 테스트용 비율 옵션들
  const aspectRatioOptions = [
    { value: 'auto', label: '자동 (동기화)' },
    { value: '16/9', label: '16:9 (와이드)' },
    { value: '4/3', label: '4:3 (표준)' },
    { value: '1/1', label: '1:1 (정사각형)' },
    { value: '9/16', label: '9:16 (세로)' },
    { value: '21/9', label: '21:9 (울트라와이드)' },
    { value: '3/4', label: '3:4 (세로)' },
  ];

  // 뷰포트 동기화 적용
  useEffect(() => {
    console.log(
      `>>>>>[Viewport Sync] Applied aspect ratio:, ${currentViewport?.aspectRatio})`,
      adminSyncEnabled
    );
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;

    // 현재 window 크기 기반으로 최적 크기 계산
    const calculateOptimalSize = (aspectRatio: number) => {
      const containerPadding = 32; // 좌우 패딩 16px * 2
      const headerHeight = 120; // 헤더 + 상태바 높이

      const availableWidth = window.innerWidth - containerPadding;
      const availableHeight = window.innerHeight - headerHeight;

      // aspect ratio에 따른 width, height 계산
      let optimalWidth = availableWidth;
      let optimalHeight = optimalWidth / aspectRatio;

      // 높이가 사용 가능한 높이를 초과하면 높이 기준으로 재계산
      if (optimalHeight > availableHeight) {
        optimalHeight = availableHeight;
        optimalWidth = optimalHeight * aspectRatio;
      }

      return { width: optimalWidth, height: optimalHeight };
    };

    // 테스트 모드일 때는 수동 설정 비율 사용
    if (testAspectRatio !== 'auto') {
      const ratio = parseAspectRatio(testAspectRatio) ?? DEFAULT_ASPECT_RATIO;
      const { width, height } = calculateOptimalSize(ratio);

      viewer.style.width = `${width}px`;
      viewer.style.height = `${height}px`;
      viewer.style.aspectRatio = testAspectRatio;
      viewer.style.maxWidth = 'none';
      viewer.style.maxHeight = 'none';
      viewer.setAttribute('data-test-mode', 'true');
      return;
    }

    // 자동 모드일 때는 기존 동기화 로직 사용
    if (!currentViewport || !adminSyncEnabled) {
      const { width, height } = calculateOptimalSize(DEFAULT_ASPECT_RATIO);
      viewer.style.width = `${width}px`;
      viewer.style.height = `${height}px`;
      viewer.style.aspectRatio = '16 / 9';
      viewer.setAttribute('data-test-mode', 'false');
      return;
    }

    const aspectRatio = currentViewport.aspectRatio;
    const { width, height } = calculateOptimalSize(aspectRatio);

    // 계산된 크기 적용
    viewer.style.width = `${width}px`;
    viewer.style.height = `${height}px`;
    viewer.style.aspectRatio = aspectRatio.toFixed(3);
    viewer.setAttribute('data-test-mode', 'false');

    // 디바이스 타입별 추가 조정
    viewer.setAttribute('data-device-type', currentViewport.deviceType);
    viewer.setAttribute('data-orientation', currentViewport.orientation);

    // 디바이스 타입에 따른 추가 스타일 적용
    switch (currentViewport.deviceType) {
      case 'mobile':
        viewer.style.borderRadius = '4px';
        break;
      case 'tablet':
        viewer.style.borderRadius = '6px';
        break;
      default:
        viewer.style.borderRadius = '8px';
        break;
    }
  }, [currentViewport, adminSyncEnabled, testAspectRatio]);

  // 윈도우 리사이즈 시 재계산
  useEffect(() => {
    const handleResize = () => {
      if (!viewerRef.current) return;

      const viewer = viewerRef.current;
      const containerPadding = 32;
      const headerHeight = 120;

      const availableWidth = window.innerWidth - containerPadding;
      const availableHeight = window.innerHeight - headerHeight;

      let currentAspectRatio = DEFAULT_ASPECT_RATIO; // 기본값

      if (testAspectRatio !== 'auto') {
        currentAspectRatio =
          parseAspectRatio(testAspectRatio) ?? DEFAULT_ASPECT_RATIO;
      } else if (currentViewport && adminSyncEnabled) {
        currentAspectRatio = currentViewport.aspectRatio;
      }

      let optimalWidth = availableWidth;
      let optimalHeight = optimalWidth / currentAspectRatio;

      if (optimalHeight > availableHeight) {
        optimalHeight = availableHeight;
        optimalWidth = optimalHeight * currentAspectRatio;
      }

      viewer.style.width = `${optimalWidth}px`;
      viewer.style.height = `${optimalHeight}px`;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentViewport, adminSyncEnabled, testAspectRatio]);

  const getDeviceTypeText = () => {
    if (!currentViewport) return '';

    const deviceTexts = {
      mobile: '📱 모바일',
      tablet: '📟 태블릿',
      desktop: '🖥️ 데스크톱',
    };

    // 상세한 디바이스 정보가 있는 경우
    if (currentViewport.device) {
      const { device } = currentViewport;
      const osText = device.os.version
        ? `${device.os.name} ${device.os.version}`
        : device.os.name;

      const browserText =
        device.browser.version !== 'Unknown'
          ? `${device.browser.name} ${device.browser.version}`
          : device.browser.name;

      const deviceInfo = [
        deviceTexts[currentViewport.deviceType],
        osText,
        browserText,
        `${currentViewport.width}×${currentViewport.height}`,
        `${currentViewport.aspectRatio.toFixed(2)}:1`,
      ].join(' | ');

      // 추가 정보 (네트워크, 배터리)
      const additionalInfo: string[] = [];
      if (device.network?.effectiveType) {
        additionalInfo.push(`📶 ${device.network.effectiveType.toUpperCase()}`);
      }
      if (device.battery?.level !== undefined) {
        const batteryIcon = device.battery.charging
          ? '🔌'
          : device.battery.level > 0.2
            ? '🔋'
            : '🪫';
        additionalInfo.push(
          `${batteryIcon} ${Math.round(device.battery.level * 100)}%`
        );
      }
      if (device.touchSupport) {
        additionalInfo.push('👆 터치');
      }

      return additionalInfo.length > 0
        ? `${deviceInfo} | ${additionalInfo.join(' | ')}`
        : deviceInfo;
    }

    // 기본 정보만 있는 경우
    return `${deviceTexts[currentViewport.deviceType]} ${currentViewport.width}×${currentViewport.height}`;
  };

  return (
    <ViewerContainer
      ref={viewerRef}
      className={`synchronized-tour-viewer ${className || ''}`}
    >
      <ViewerContent>
        {children || (
          <PlaceholderText>
            투어 뷰어가 여기에 표시됩니다
            <br />
            사용자 연결 시 화면 비율이 자동 동기화됩니다
          </PlaceholderText>
        )}
      </ViewerContent>

      {/* 비율 테스트용 Selector */}
      <AspectRatioSelector>
        <Select
          value={testAspectRatio}
          onChange={(e) => setTestAspectRatio(e.target.value)}
        >
          {aspectRatioOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </AspectRatioSelector>

      {currentViewport && testAspectRatio === 'auto' && (
        <DeviceTypeIndicator>{getDeviceTypeText()}</DeviceTypeIndicator>
      )}

      {testAspectRatio !== 'auto' && (
        <DeviceTypeIndicator>
          🧪 테스트 모드:{' '}
          {
            aspectRatioOptions.find((opt) => opt.value === testAspectRatio)
              ?.label
          }
        </DeviceTypeIndicator>
      )}
    </ViewerContainer>
  );
};
