export function trimDeg(deg: number) {
  while (deg > 360) {
    deg = deg - 360;
  }

  while (deg < 0) {
    deg = deg + 360;
  }

  return deg;
}

export function radToDeg(rad: number) {
  const deg = rad * (180 / Math.PI);
  return trimDeg(deg);
}
// @deprecated
export function tourYawToO3DYaw(tourYaw: number, tourOffset: number) {
  return (-tourYaw - tourOffset + Math.PI) % (Math.PI * 2);
}

export function o3dSceneCameraYaw(
  tourSceneYaw: number,
  tourSceneOffset: number
) {
  return (-tourSceneYaw - tourSceneOffset + Math.PI) % (Math.PI * 2);
}

export function o3dTextureOffset(tourSceneOffset: number) {
  return -tourSceneOffset + Math.PI / 2;
}
