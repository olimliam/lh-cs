import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class LhApiClientService {
  private readonly logger = new Logger(LhApiClientService.name);

  constructor(
    @Inject(forwardRef(() => ConsultationService))
    private readonly consultationService: ConsultationService
  ) {}

  /**
   * 상담실 세부 정보 조회
   */
  async getConsultationDetails(consultationId: string): Promise<any> {
    // 로컬 consultation service를 통해 조회
    const consultation =
      await this.consultationService.getConsultationById(consultationId);

    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return consultation;
  }

  /**
   * 연결 상태에 따른 상담실 상태 업데이트
   */
  async updateConsultationStatusByConnection(
    consultationId: string,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): Promise<void> {
    // 로컬 consultation service를 통해 업데이트
    const updated =
      await this.consultationService.updateConsultationStatusByConnection(
        consultationId,
        isAdminConnected,
        isVisitorConnected
      );

    if (!updated) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
