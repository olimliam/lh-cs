import { ConsultationDto } from '../consultation.dto';
import { ConsultationEntity } from '../../../infrastructure/repository/entity/consultation.entity';
import { ReadConsultationEntity } from '../../../infrastructure/repository/entity/read-consultation.entity';

export class ConsultationResponse extends ConsultationDto {
  /**
   * ConsultationEntity에서 Response로 변환 (JOIN 쿼리용)
   */
  static fromEntity(entity: ConsultationEntity): ConsultationResponse {
    return Object.assign(new ConsultationResponse(), ConsultationDto.fromEntity(entity));
  }

  /**
   * ReadConsultationEntity에서 Response로 변환 (성능 최적화용)
   */
  static fromReadEntity(entity: ReadConsultationEntity): ConsultationResponse {
    return Object.assign(new ConsultationResponse(), ConsultationDto.fromReadEntity(entity));
  }

  /**
   * Entity 배열을 Response 배열로 변환 (JOIN 쿼리용)
   */
  static fromEntities(entities: ConsultationEntity[]): ConsultationResponse[] {
    return entities.map(entity => ConsultationResponse.fromEntity(entity));
  }

  /**
   * ReadEntity 배열을 Response 배열로 변환 (성능 최적화용)
   */
  static fromReadEntities(entities: ReadConsultationEntity[]): ConsultationResponse[] {
    return entities.map(entity => ConsultationResponse.fromReadEntity(entity));
  }
}
