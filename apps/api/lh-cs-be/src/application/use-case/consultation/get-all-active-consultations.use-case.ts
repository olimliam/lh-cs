import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationResponse } from '@/presentation/dto/response';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import { UserRoleEnum } from '@/infrastructure/repository/entity/user.entity';

@Injectable()
export class GetAllActiveConsultationsUseCase {
  private readonly logger = new Logger(GetAllActiveConsultationsUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<ConsultationResponse[]> {
    this.logger.log(`getAllActiveConsultations called for user: ${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
        HttpStatus.NOT_FOUND,
        '사용자 정보를 찾을 수 없습니다.'
      );
    }

    const hasAdminPermission =
      user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.SUPER_ADMIN;

    const consultations = hasAdminPermission
      ? await this.consultationQueryRepository.findAllActiveFromReadModel()
      : await this.consultationQueryRepository.findActiveByUserIdFromReadModel(
          userId
        );

    if (!consultations) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
        HttpStatus.BAD_REQUEST,
        '활성 상담실 조회에 실패했습니다.'
      );
    }

    return ConsultationResponse.fromReadEntities(consultations);
  }
}
