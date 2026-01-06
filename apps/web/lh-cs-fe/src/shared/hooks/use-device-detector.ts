import { useMediaQuery } from 'react-responsive';
import {
  isMobileOnly,
  isTablet as isDetectedTablet,
} from 'react-device-detect';
import { DeviceWidth } from '../styles/theme';

// theme.ts에 공통으로 const 정의
// export const deviceWidth = {
//   desktop: 1280,
//   laptop: 1279,
//   tablet: 1024,
//   fold: 767,
//   mobileLg: 673,
//   mobile: 427,
//   mobileSm: 359,
// };

const deviceWidth = DeviceWidth;

export const useDeviceDetector = () => {
  const isDesktopViewport = useMediaQuery({ minWidth: deviceWidth.desktop });
  const isLaptopViewport = useMediaQuery({ maxWidth: deviceWidth.laptop });
  const isTabletViewport = useMediaQuery({ maxWidth: deviceWidth.tablet });
  const isFoldViewport = useMediaQuery({ maxWidth: deviceWidth.fold });
  const isMobileLgViewport = useMediaQuery({ maxWidth: deviceWidth.mobileLg });
  const isMobileViewport = useMediaQuery({ maxWidth: deviceWidth.mobile });
  const isMobileSmViewport = useMediaQuery({ maxWidth: deviceWidth.mobileSm });

  const isDesktop = isDesktopViewport;
  const isLaptop = isLaptopViewport;
  const isTablet = isTabletViewport || isDetectedTablet;
  const isFold = isFoldViewport;
  const isMobileLg = isMobileLgViewport || isMobileOnly;
  const isMobile = isMobileViewport || isMobileOnly;
  const isMobileSm = isMobileSmViewport || isMobileOnly;

  // Determine the device name based on the viewport or device type
  const getDeviceName = () => {
    if (isMobileLg) {
      return 'mobile';
    } else if (isTablet) {
      return 'tablet';
    } else if (isLaptop) {
      return 'laptop';
    } else {
      return 'desktop';
    }
  };

  return {
    isDesktop,
    isLaptop,
    isTablet,
    isFold,
    isMobileLg,
    isMobile,
    isMobileSm,
    getDeviceName, // Optional: return the device name function
  };
};

export const device = {
  desktop: `@media screen and (min-width: ${deviceWidth.desktop}px)`,
  laptop: `@media screen and (max-width: ${deviceWidth.laptop}px)`,
  tablet: `@media screen and (max-width: ${deviceWidth.tablet}px)`,
  fold: `@media screen and (max-width: ${deviceWidth.fold}px)`,
  mobileLg: `@media screen and (max-width: ${deviceWidth.mobileLg}px)`,
  mobile: `@media screen and (max-width: ${deviceWidth.mobile}px)`,
  mobileSm: `@media screen and (max-width: ${deviceWidth.mobileSm}px)`,
};
