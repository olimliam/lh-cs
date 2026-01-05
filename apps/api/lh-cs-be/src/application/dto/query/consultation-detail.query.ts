/**
 * 상담실 상세 조회 쿼리 DTO
 */
export class GetConsultationQuery {
  consultationId: string;
  includeHistory: boolean;
  includeRelations: boolean;

  constructor(params: {
    consultationId: string;
    includeHistory?: boolean;
    includeRelations?: boolean;
  }) {
    this.consultationId = params.consultationId;
    this.includeHistory = params.includeHistory ?? false;
    this.includeRelations = params.includeRelations ?? true;
  }
}

/**
 * 상담실 통계 쿼리 DTO
 */
export class GetConsultationStatsQuery {
  tourId?: string;
  userId?: string;
  startDate: Date;
  endDate: Date;
  groupBy: 'day' | 'week' | 'month';

  constructor(params: {
    tourId?: string;
    userId?: string;
    startDate: Date;
    endDate: Date;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    this.tourId = params.tourId;
    this.userId = params.userId;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.groupBy = params.groupBy ?? 'day';
  }

  validate(): void {
    if (this.startDate > this.endDate) {
      throw new Error('시작일은 종료일보다 작거나 같아야 합니다.');
    }

    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      throw new Error('조회 기간은 최대 1년까지 가능합니다.');
    }
  }
}
