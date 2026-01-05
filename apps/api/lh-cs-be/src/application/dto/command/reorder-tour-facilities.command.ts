/**
 * 투어 시설 순서 변경 DTO (Application Layer)
 */
export class ReorderTourFacilitiesCommand {
  /**
   * 투어 ID
   */
  tourId: string;

  /**
   * 순서 변경 정보
   */
  facilities: Array<{
    id: string;
    displayOrder: number;
  }>;
}
