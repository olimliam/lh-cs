import * as BABYLON from '@babylonjs/core';
import { O3DModel } from '../models/o3d';
// 유틸성 함수 : 모델의 버텍스 수를 추출한다
// ext : 확장자 (.obj, .glb)
export const modelVertexCount = async (
  url: string,
  ext?: '.obj' | '.glb'
): Promise<number> => {
  const canvas = document.createElement('canvas');
  const engine = new BABYLON.Engine(canvas, false);
  const scene = new BABYLON.Scene(engine);

  const meshResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    url,
    '',
    scene,
    null,
    ext
  );

  const result = meshResult.meshes.reduce((m, n) => {
    return m + n.getTotalVertices();
  }, 0);

  engine.dispose();
  canvas.remove();

  return result;
};


// 유틸성 함수 : 2D 모델 사이즈 계산 (TODO 최적화)
export const calcModelSize2D = async (
  url: string
): Promise<{
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}> => {
  const canvas = document.createElement('canvas');
  const engine = new BABYLON.Engine(canvas, false);
  const scene = new BABYLON.Scene(engine);

  const meshResult = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    url,
    '',
    scene
  );

  const validMeshs = meshResult.meshes.filter((x) => {
    return !!x.getTotalVertices();
  });

  const mesh = BABYLON.Mesh.MergeMeshes(
    validMeshs as BABYLON.Mesh[],
    true,
    true,
    undefined,
    true,
    false
  );

  if (!mesh) {
    throw new Error('Can not merge mesh');
  }

  const boundingBox = mesh.getBoundingInfo().boundingBox;

  const width = Math.abs(boundingBox.maximum.x - boundingBox.minimum.x);
  const height = Math.abs(boundingBox.maximum.z - boundingBox.minimum.z);
  const centerX = boundingBox.center.x;
  const centerY = boundingBox.center.y;
  const centerZ = boundingBox.center.z;

  engine.dispose();
  canvas.remove();

  return {
    width,
    height,
    centerX,
    centerY,
    centerZ,
  };
};


export const getModelSize2D = async (
  model: O3DModel
): Promise<{
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}> => {
  if (model) {
    const mesh = model.getMesh();

    const boundingBox = mesh.getBoundingInfo().boundingBox;

    const width = Math.abs(boundingBox.maximum.x - boundingBox.minimum.x);
    const height = Math.abs(boundingBox.maximum.z - boundingBox.minimum.z);
    const centerX = boundingBox.center.x;
    const centerY = boundingBox.center.y;
    const centerZ = boundingBox.center.z;

    return {
      width,
      height,
      centerX,
      centerY,
      centerZ,
    };
  } else {
    return {
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
    };
  }
};
