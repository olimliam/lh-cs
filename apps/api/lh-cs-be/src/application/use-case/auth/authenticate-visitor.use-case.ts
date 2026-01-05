import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConsultationService } from '../../service/consultation.service';
import { StatisticsService } from '../../service/statistics.service';
import { UserService } from '../../service/user.service';
import { VisitorAuthRequest } from '@/presentation/dto/request/visitor-auth.request';
import { VisitorAuthResponse } from '@/presentation/dto/response/visitor-auth.response';
import {
  AuthErrorCode,
  AuthErrorData,
} from '@/common/exception/error/auth-error-code.enum';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';

@Injectable()
export class AuthenticateVisitorUseCase {
  constructor(
    private readonly consultationService: ConsultationService,
    private readonly statisticsService: StatisticsService,
    private readonly userService: UserService
  ) {}

  async execute(
    visitorAuthDto: VisitorAuthRequest
  ): Promise<VisitorAuthResponse> {
    const consultation = await this.consultationService.findByEnterCode(
      visitorAuthDto.enterCode
    );

    if (!consultation) {
      throw new UnauthorizedException(
        AuthErrorData[AuthErrorCode.VISITOR_INVALID_ENTER_CODE]
      );
    }

    if (consultation.id !== visitorAuthDto.consultationId) {
      throw new UnauthorizedException(
        AuthErrorData[AuthErrorCode.VISITOR_FORBIDDEN_CONSULTATION]
      );
    }

    if (!consultation.isActive || consultation.status === 'END') {
      throw new UnauthorizedException(
        AuthErrorData[AuthErrorCode.VISITOR_CONSULTATION_NOT_ACTIVE]
      );
    }

    await this.consultationService.updateVisitorId(
      consultation.id,
      visitorAuthDto.visitorId
    );

    try {
      await this.statisticsService.createConsultationLog({
        actionType: ConsultationLogActionTypeEnum.VISITOR_ENTER,
        actionValue: visitorAuthDto.visitorId,
        consultationId: consultation.id,
        counselorId: null,
        tourId: consultation.tourId,
        facilityId: consultation.startTourFacilityId,
        device: null,
        ipAddress: null,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to log visitor enter:', error);
    }

    const consultant = await this.userService.findById(consultation.userId);

    return {
      success: true,
      consultationId: consultation.id,
      visitorId: consultation.visitorId,
      consultantName: consultant?.name || '상담사',
      message: '상담실 입장 성공',
    };
  }
}
