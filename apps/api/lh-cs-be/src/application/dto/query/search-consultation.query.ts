import { ConsultationStatus } from '@/infrastructure/repository/entity';

export interface SearchConsultationQuery {
  userId?: string;
  roomNumber?: string;
  status?: ConsultationStatus;
  tourId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
