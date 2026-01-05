import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../../infrastructure/repository/entity/consultation.entity';
import { ResponsePayload } from '@/common/dto/response-payload.dto';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class UpdateConsultationStatusByConnectionUseCase {
  private readonly logger = new Logger(
    UpdateConsultationStatusByConnectionUseCase.name
  );

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  async execute(
    consultationId: string,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): Promise<ResponsePayload<ConsultationStatus | null>> {
    const consultation = await this.queryRepository.findById(consultationId);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const { newStatus, shouldRequestEnd } = this.determineStatus(
        consultation,
        isAdminConnected,
        isVisitorConnected
      );

      if (consultation.status === newStatus) {
        this.logger.log(
          `Consultation ${consultationId} status is already ${newStatus}`
        );
        return {
          data: consultation.status,
          message: '상담실 상태가 변경되지 않았습니다.',
        };
      }

      const { isStartingConsultation, isRestartingFromEnd, consultingStartedAt } =
        this.determineTransitionFlags(consultation, newStatus);

      this.logger.log(
        `Consultation status transition: ${consultation.status} -> ${newStatus}, isStarting: ${isStartingConsultation}, isRestarting: ${isRestartingFromEnd}, startTime: ${consultingStartedAt?.toISOString()}`
      );

      await this.persistStatus(
        consultationId,
        newStatus,
        isRestartingFromEnd,
        shouldRequestEnd,
        consultingStartedAt
      );

      await this.syncReadModel(
        consultationId,
        newStatus,
        isRestartingFromEnd,
        shouldRequestEnd,
        consultingStartedAt
      );

      if (shouldRequestEnd) {
        await this.notifyConsultationEnding(consultationId);
      }

      return {
        data: newStatus,
        message: '상담실 상태 업데이트 성공',
      };
    } catch (error) {
      this.logger.error(
        'Failed to update consultation status by connection:',
        error
      );
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담실 상태 업데이트에 실패했습니다.'
      );
    }
  }

  private determineStatus(
    consultation: ConsultationEntity,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): { newStatus: ConsultationStatus; shouldRequestEnd: boolean } {
    let newStatus: ConsultationStatus;
    let shouldRequestEnd = false;

    if (consultation.status === ConsultationStatus.END && isAdminConnected) {
      newStatus = ConsultationStatus.READY;
      this.logger.log(
        `Consultation ${consultation.id} restarting from END to READY due to admin connection`
      );
    } else if (
      consultation.status === ConsultationStatus.CONSULTING &&
      !isAdminConnected
    ) {
      newStatus = ConsultationStatus.END;
      shouldRequestEnd = true;
      this.logger.log(
        `Consultation ${consultation.id} requesting end due to manager disconnection from CONSULTING state`
      );
    } else if (isAdminConnected && isVisitorConnected) {
      newStatus = ConsultationStatus.CONSULTING;
    } else if (isAdminConnected || isVisitorConnected) {
      newStatus = ConsultationStatus.READY;
    } else {
      newStatus = ConsultationStatus.READY;
    }

    return { newStatus, shouldRequestEnd };
  }

  private determineTransitionFlags(
    consultation: ConsultationEntity,
    newStatus: ConsultationStatus
  ) {
    const isStartingConsultation =
      consultation.status !== ConsultationStatus.CONSULTING &&
      newStatus === ConsultationStatus.CONSULTING;
    const isRestartingFromEnd =
      consultation.status === ConsultationStatus.END &&
      newStatus === ConsultationStatus.READY;
    const consultingStartedAt = isStartingConsultation ? new Date() : undefined;

    return { isStartingConsultation, isRestartingFromEnd, consultingStartedAt };
  }

  private async persistStatus(
    consultationId: string,
    newStatus: ConsultationStatus,
    isRestartingFromEnd: boolean,
    shouldRequestEnd: boolean,
    consultingStartedAt?: Date
  ): Promise<void> {
    if (isRestartingFromEnd) {
      this.logger.log(
        `Restarting consultation ${consultationId} from END to READY`
      );
      await this.commandRepository.restartConsultation(consultationId);
      return;
    }

    if (shouldRequestEnd) {
      const now = new Date();
      this.logger.log(
        `Requesting end for consultation ${consultationId} due to manager disconnection`
      );
      await this.commandRepository.requestEndConsultation(consultationId, now);
      return;
    }

    if (consultingStartedAt) {
      this.logger.log(
        `Updating consultation ${consultationId} with start time: ${consultingStartedAt.toISOString()}`
      );
      await this.commandRepository.updateStatusAndStartTime(
        consultationId,
        newStatus,
        consultingStartedAt
      );
      return;
    }

    await this.commandRepository.updateStatus(consultationId, newStatus);
  }

  private async syncReadModel(
    consultationId: string,
    newStatus: ConsultationStatus,
    isRestartingFromEnd: boolean,
    shouldRequestEnd: boolean,
    consultingStartedAt?: Date
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
        consultingStartedAt,
      };

      if (isRestartingFromEnd) {
        updateData.endRequestedAt = undefined;
      }

      if (shouldRequestEnd) {
        updateData.endRequestedAt = new Date();
      }

      await this.readRepository.updateReadModel(consultationId, updateData);
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }

  private async notifyConsultationEnding(
    consultationId: string
  ): Promise<void> {
    try {
      this.broadcastManager.broadcastConsultationEnding(consultationId);
      this.logger.log(
        `Successfully notified WebSocket clients about consultation ${consultationId} ending`
      );
    } catch (error) {
      this.logger.error(
        `Error notifying WebSocket clients about consultation ${consultationId}:`,
        error
      );
    }
  }
}
