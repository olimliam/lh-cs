import { Injectable, BadRequestException } from '@nestjs/common';
import { ConsultationService } from '../../service/consultation.service';
import { VisitorIdCheckRequest } from '@/presentation/dto/request/visitor-id-check.request';
import { VisitorIdCheckResponse } from '@/presentation/dto/response/visitor-id-check.response';
import {
  AuthErrorCode,
  AuthErrorData,
} from '@/common/exception/error/auth-error-code.enum';

@Injectable()
export class CheckVisitorIdUseCase {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(
    private readonly consultationService: ConsultationService
  ) {}

  async execute(
    visitorId: string,
    _checkDto: VisitorIdCheckRequest
  ): Promise<VisitorIdCheckResponse> {
    if (!this.uuidRegex.test(visitorId)) {
      throw new BadRequestException(
        AuthErrorData[AuthErrorCode.VISITOR_ID_INVALID_FORMAT]
      );
    }

    const activeConsultation =
      await this.consultationService.findActiveConsultationByVisitorId(
        visitorId
      );

    if (activeConsultation) {
      return {
        success: true,
        visitorId,
        isExisting: true,
        consultationStatus: activeConsultation.status,
        activeConsultationId: activeConsultation.id,
        message: `진행중인 상담이 있습니다 (상담사: ${activeConsultation.consultantName})`,
      };
    }

    return {
      success: true,
      visitorId,
      isExisting: true,
      message: '유효한 visitor ID입니다',
    };
  }
}
