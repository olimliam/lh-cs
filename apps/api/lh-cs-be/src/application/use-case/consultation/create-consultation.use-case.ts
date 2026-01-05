import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { ConsultationCodeGenerator } from '../../../common/utils/consultation-code-generator';
import { StatisticsService } from '../../service/statistics.service';
import { CreateConsultationCommand } from '../../dto/command/create-consultation.command';
import { ConsultationResponse } from '@/presentation/dto/response/consultation.response';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';
import { ConsultationEntity } from '../../../infrastructure/repository/entity/consultation.entity';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class CreateConsultationUseCase {
  private readonly logger = new Logger(CreateConsultationUseCase.name);

  constructor(
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly readRepository: ReadConsultationRepository,
    private readonly codeGenerator: ConsultationCodeGenerator,
    private readonly statisticsService: StatisticsService
  ) {}

  async execute(
    createDto: CreateConsultationCommand
  ): Promise<ConsultationResponse> {
    try {
      const normalizedCode = createDto.consultationCode?.trim();
      if (!normalizedCode) {
        throw new CustomException(
          ConsultationErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          '상담 코드는 필수입니다.'
        );
      }

      const duplicated =
        await this.queryRepository.findByConsultationCode(normalizedCode);
      if (duplicated) {
        throw new CustomException(
          ConsultationErrorCode.CONSULTATION_CODE_ALREADY_IN_USE,
          HttpStatus.BAD_REQUEST,
          '이미 사용중인 상담 코드입니다.'
        );
      }

      const roomNumber = this.codeGenerator.generateRoomNumber();
      const enterCode = this.codeGenerator.generateEnterCode();

      const enrichedDto = {
        ...createDto,
        consultationCode: normalizedCode,
        roomNumber,
        enterCode,
      };

      const newConsultation = await this.commandRepository.create(enrichedDto);

      await this.logCreation(newConsultation.id, createDto);

      const consultation = await this.queryRepository.findById(
        newConsultation.id
      );
      if (!consultation) {
        throw new CustomException(
          ConsultationErrorCode.CONSULTATION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          '상담실 정보를 찾을 수 없습니다.'
        );
      }

      await this.syncReadModel(consultation);

      return ConsultationResponse.fromEntity(consultation);
    } catch (error) {
      this.logger.error('Failed to create consultation:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_CREATE_FAILED,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async logCreation(
    consultationId: string,
    createDto: CreateConsultationCommand
  ) {
    try {
      await this.statisticsService.createConsultationLog({
        actionType: ConsultationLogActionTypeEnum.CONSULTATION_CREATE,
        actionValue: null,
        consultationId,
        counselorId: createDto.userId,
        tourId: createDto.tourId,
        facilityId: createDto.startTourFacilityId,
        device: null,
        ipAddress: null,
      });
    } catch (error) {
      this.logger.error('Failed to log consultation creation:', error);
    }
  }

  private async syncReadModel(consultation: ConsultationEntity) {
    try {
      await this.readRepository.createReadModel(consultation);
    } catch (error) {
      this.logger.error('Failed to create read model:', error);
    }
  }
}
