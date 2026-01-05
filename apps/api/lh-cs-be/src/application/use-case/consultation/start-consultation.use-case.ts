import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { StartConsultationCommand } from '../../dto/command/start-consultation.command';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';

@Injectable()
export class StartConsultationUseCase {
  private readonly logger = new Logger(StartConsultationUseCase.name);

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository
  ) {}

  async execute(id: string, startDto: StartConsultationCommand): Promise<void> {
    this.logger.log('startConsultation called', {
      id,
      visitorId: startDto.visitorId,
    });

    const consultation = await this.queryRepository.findById(id);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (consultation.status !== ConsultationStatus.READY) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_INVALID_STATUS,
        HttpStatus.BAD_REQUEST,
        '시작할 수 없는 상태의 상담실입니다.'
      );
    }

    try {
      await this.commandRepository.assignVisitor(id, startDto.visitorId);
      await this.commandRepository.updateStatus(
        id,
        ConsultationStatus.CONSULTING
      );

      await this.updateReadModel(id, startDto.visitorId);

      this.logger.log('Consultation started successfully', {
        id,
        visitorId: startDto.visitorId,
      });
    } catch (error) {
      this.logger.error('Failed to start consultation:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_START_FAILED,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async updateReadModel(id: string, visitorId: string) {
    try {
      await this.readRepository.updateReadModel(id, {
        visitorId,
        status: ConsultationStatus.CONSULTING,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }
}
