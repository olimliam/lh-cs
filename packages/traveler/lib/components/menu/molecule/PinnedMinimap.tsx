/** @jsxImportSource @emotion/react */
import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

import Minimap from './Minimap';
import { useDeviceDetector } from '../../../hooks/useDeviceDetector';
import {
  ControlBarPosition,
  ControlBarPositionConst,
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';
import { useToolbar } from '../../../contexts/ToolBarContext';

const Root = styled.div<{
  barPosition: ControlBarPosition;
  barStyle: ControlBarStyle;
}>`
  width: 300px;
  padding: 12px;
  background-color: #111;
  position: absolute;
  left: 20px;
  bottom: 20px;
  border: 1px solid white;
  border-radius: 8px;
  z-index: 10;

  @media (max-width: 768px) {
    width: 160px;
    left: auto;
    bottom: auto;
    right: 20px;
    top: 20px;
  }

  ${({ barPosition }) =>
    barPosition === ControlBarPositionConst.LEFT &&
    css`
      left: auto;
      right: 20px;
      bottom: auto;
      top: 20px;
    `}

  ${({ barStyle }) => {
    if (barStyle === ControlBarStyleConst.SQUARE_BLACK) {
      return css`
        border: 0;
        border-radius: 4px;
      `;
    }
    if (barStyle === ControlBarStyleConst.CLEAR_WHITE) {
      return css`
        background: linear-gradient(
            175deg,
            rgba(0, 0, 0, 0.02) 0.94%,
            rgba(0, 0, 0, 0) 20.92%
          ),
          linear-gradient(
            177deg,
            rgba(255, 255, 255, 0.17) 7.16%,
            rgba(188, 188, 188, 0.15) 97.47%
          );
        border-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(15px);
        border-radius: 4px;
      `;
    }
    if (barStyle === ControlBarStyleConst.ROUND_WHITE) {
      return css`
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(2px);
        border-color: #d1d1d1;
      `;
    }
  }}
`;

function PinnedMinimap() {
  const [mapHeight, setMapHeight] = useState<number>(0);

  const { barPosition, barStyle, setPinnedHeight } = useToolbar();

  const { isTablet } = useDeviceDetector();

  const mapEl = useCallback((el: HTMLDivElement) => {
    if (!el) return;
    setMapHeight(el.offsetHeight + 26);
  }, []);

  useEffect(() => {
    if (!mapHeight) return;
    setPinnedHeight(mapHeight);
  }, [mapHeight]);

  return (
    <>
      <Root barPosition={barPosition} barStyle={barStyle}>
        <Minimap ref={mapEl} width={isTablet ? 100 : 200} />
      </Root>
    </>
  );
}

export default PinnedMinimap;
