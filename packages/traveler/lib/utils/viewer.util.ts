import { TourKeymap } from "../types/tour";

export function to2DRatioPosition({
  sX,
  sY,
  minimap,
  modelSize,
}: {
  sX: number;
  sY: number;
  minimap: TourKeymap;
  modelSize: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    centerZ: number;
  };
}) {
  const minimapWidth = minimap.width || modelSize.width;
  const minimapHeight = minimap.height || modelSize.height;

  const ratio =
    Math.max(minimapWidth, minimapHeight) /
    Math.min(minimapWidth, minimapHeight);

  const mH = modelSize.height || 0;

  const scaleX = minimap.scaleX || 1;
  const scaleY = minimap.scaleY || 1;

  const width = mH * ratio;
  const height = mH;

  const finOffsetX = width * (minimap.positionX / minimapWidth);
  const finOffsetY = height * (minimap.positionY / minimapHeight);

  const finWidth = width * scaleX;
  const finHeight = height * scaleY;

  const gapH = finHeight - modelSize.height;
  const gapW = finWidth - modelSize.width;

  const rx = sX - finOffsetX;
  const ry = sY - finOffsetY;

  const x = (() => {
    if (rx < 0) {
      return modelSize.width / 2 - Math.abs(rx);
    } else {
      return modelSize.width / 2 + rx;
    }
  })();

  const y = (() => {
    if (ry < 0) {
      return modelSize.height / 2 - Math.abs(ry);
    } else {
      return modelSize.height / 2 + ry;
    }
  })();

  const resultX = (x + gapW / 2 - modelSize.centerX) / finWidth;
  const resultY = (y + gapH / 2 - modelSize.centerZ) / finHeight;

  if (
    !(
      (isNaN(resultX) || !isFinite(resultX)) &&
      (isNaN(resultY) || !isFinite(resultY))
    )
  ) {
    return {
      x: resultX * 100,
      y: resultY * 100,
    };
  }
}
