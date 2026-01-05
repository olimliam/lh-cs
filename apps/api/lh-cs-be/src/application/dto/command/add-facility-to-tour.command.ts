/**
 * 투어에 시설 추가 DTO (Application Layer)
 */
export class AddFacilityToTourCommand {
  /**
   * 투어 ID
   */
  tourId: string;

  /**
   * 시설 ID
   */
  facilityId: string;

  /**
   * Scene ID
   */
  sceneId: string;

  /**
   * 카메라 포지션 X
   */
  cameraPosX?: number;

  /**
   * 카메라 포지션 Y
   */
  cameraPosY?: number;

  /**
   * 카메라 포지션 Z
   */
  cameraPosZ?: number;

  /**
   * 기본 시작 위치 여부
   */
  isDefaultStart?: boolean;

  /**
   * 표시 순서
   */
  displayOrder?: number;
}
