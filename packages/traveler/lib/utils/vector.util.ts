import * as BABYLON from '@babylonjs/core';

// 유틸성 함수 : 언리얼에서 추출된 x,y,z값을 바빌론 벡터로 바꿔준다
export const makeVector = (x: number, y: number, z: number) => {
  return new BABYLON.Vector3(x, z, y);
};

// 유틸성 함수 : 두 벡터간의 길이를 잰다
export const vectorLength = (v1: BABYLON.Vector3, v2: BABYLON.Vector3) => {
  return BABYLON.Vector3.Distance(v1, v2);
};


export const angleBetweenVectors = (
  v1: BABYLON.Vector3,
  v2: BABYLON.Vector3
) => {
  const x1 = v1.x;
  const x2 = v2.x;

  const y1 = v1.z;
  const y2 = v2.z;

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.atan2(deltaY, deltaX);
};
