import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';

/**
 * 상담실 검색 쿼리 DTO
 * - 서비스 레이어에서 복잡한 검색 로직용
 * - 도메인 로직에 특화된 필터링
 */
export class SearchConsultationsQuery {
  // 기본 필터
  tourId?: string;
  userId?: string;
  status?: ConsultationStatus;
  isActive?: boolean;

  // 날짜 범위
  startDate?: Date;
  endDate?: Date;

  // 검색어
  searchTerm?: string; // roomName, roomCode, accessCode에서 검색

  // 페이징
  page: number;
  limit: number;

  // 정렬
  sortBy: 'createdAt' | 'updatedAt' | 'status';
  sortOrder: 'ASC' | 'DESC';

  constructor(params: {
    tourId?: string;
    userId?: string;
    status?: ConsultationStatus;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'ASC' | 'DESC';
  }) {
    this.tourId = params.tourId;
    this.userId = params.userId;
    this.status = params.status;
    this.isActive = params.isActive ?? true;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.searchTerm = params.searchTerm;
    this.page = params.page ?? 1;
    this.limit = params.limit ?? 20;
    this.sortBy = params.sortBy ?? 'createdAt';
    this.sortOrder = params.sortOrder ?? 'DESC';
  }

  /**
   * 오프셋 계산
   */
  get offset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * 검색 조건 유효성 검증
   */
  validate(): void {
    if (this.page < 1) {
      throw new Error('페이지는 1 이상이어야 합니다.');
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new Error('한 페이지당 항목 수는 1-100 사이여야 합니다.');
    }
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      throw new Error('시작일은 종료일보다 작거나 같아야 합니다.');
    }
  }
}
