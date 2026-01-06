import {
  Texture,
  StandardMaterial,
  Mesh,
  Scene,
  MeshBuilder,
  Ray,
  Vector3,
  DeepImmutable,
  AbstractMesh,
} from '@babylonjs/core';

import { TourScene } from '../types/tour';

/**
 * Spot 클래스는 가상 투어 내의 특정 위치와 시점을 나타냅니다.
 * 각 스팟은 파노라마 이미지와 연결되어 있으며, 사용자가 투어 내에서 이동할 수 있는 지점을 정의합니다.
 */
export default class Spot {
  // 공개 프로퍼티
  readonly id: number;
  readonly position: Vector3;
  readonly rotation: Vector3;
  readonly beginViewAngle: Vector3;
  readonly title: string;

  // 비공개 프로퍼티
  // private tiledImgUrlPrefix: string;
  private linkedSpotIds: Set<number>;
  private mesh: Mesh;
  private panoramaTexture!: Texture;
  readonly metaData: TourScene;

  /**
   * Spot 클래스 생성자
   * @param metaData 스팟 메타데이터
   * @param size 스팟 크기
   * @param targetMatl 스팟 메시에 적용할 재질
   * @param placeMesh 스팟이 위치할 장소 메시
   * @param targetScene 스팟이 추가될 씬
   */
  constructor(
    metaData: TourScene,
    size: number,
    targetMatl: StandardMaterial,
    placeMesh: Mesh,
    targetScene: Scene
  ) {
    this.id = metaData.id;
    this.title = metaData.title;
    this.metaData = metaData;

    // 좌표계 변환 (Unreal 좌표계 → js 좌표계)
    this.position = new Vector3(metaData.x, metaData.z, metaData.y);
    this.rotation = new Vector3(
      0,
      -(metaData.offset + Math.PI / 2) % (Math.PI * 2),
      0
    );

    this.beginViewAngle = new Vector3(
      metaData.pitch % (Math.PI * 2),
      (this.rotation.y + (metaData.yaw - Math.PI) / 2) % (Math.PI * 2),
      0
    );

    // this.tiledImgUrlPrefix = metaData.layers[0].convertedImg;

    // 연결된 스팟 ID 저장
    this.linkedSpotIds = new Set(
      metaData.links.map((curLink) => {
        return curLink.destSceneID;
      })
    );

    // 스팟 메시 생성
    this.mesh = MeshBuilder.CreateDisc(
      'spotMesh-' + metaData.id,
      {
        radius: size,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      targetScene
    );

    this.mesh.visibility = 0.25;
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.checkCollisions = true;
    this.mesh.metadata = {
      isSpot: true,
      id: metaData.id,
    };
    this.mesh.material = targetMatl;

    // 바닥 위치 계산 (레이캐스팅 사용)
    const ray = new Ray(
      this.position,
      new Vector3(this.position.x, Number.MIN_SAFE_INTEGER, this.position.z),
      1
    );

    this.mesh.position.x = this.position.x;
    this.mesh.position.z = this.position.z;

    const result = ray.intersectsMesh(
      placeMesh as DeepImmutable<AbstractMesh>,
      true
    );
    if (result.hit) {
      this.mesh.position.y = (result.pickedPoint?.y || 0) + 1;
    }
  }

  /**
   * 스팟 리소스를 정리합니다.
   */
  destroy() {
    this.mesh.dispose(false, true);
    this.panoramaTexture.dispose();
  }

  /**
   * 스팟이 활성화되어 있는지 확인합니다.
   * @returns 활성화 여부
   */
  isActive() {
    return this.mesh.isEnabled() && this.mesh.isPickable;
  }

  /**
   * 스팟의 활성화 상태를 설정합니다.
   * @param isActive 활성화 여부
   */
  setActivation(isActive: boolean) {
    this.mesh.setEnabled(isActive);
    this.mesh.isPickable = isActive;
  }

  /**
   * 지정된 스팟 ID가 연결된 스팟인지 확인합니다.
   * @param targetSpotId 확인할 스팟 ID
   * @returns 연결 여부
   */
  isLinkedSpot(targetSpotId: number): boolean {
    return this.linkedSpotIds.has(targetSpotId);
  }

  /**
   * 현재 스팟의 파노라마 텍스처를 가져옵니다.
   * @returns 파노라마 텍스처
   */
  getPanoramaTexture(): Texture {
    return this.panoramaTexture;
  }

  /**
   * 스팟의 파노라마 텍스처를 비동기적으로 로드합니다.
   * @param targetUrl 파노라마 이미지 URL
   * @param targetScene 타겟 씬
   * @returns 로드 프로미스
   */
  async loadPanoramaTextureAsync(
    targetUrl: string,
    targetScene: Scene
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.panoramaTexture = new Texture(
        targetUrl,
        targetScene,
        true,
        false,
        Texture.TRILINEAR_SAMPLINGMODE,
        () => {
          resolve();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message: any) => {
          console.error('load texture fail : ', message);
          reject();
        }
      );

      this.panoramaTexture.vAng = Math.PI;
      this.panoramaTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
      this.panoramaTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
      this.panoramaTexture.hasAlpha = true;
    });
  }
}
