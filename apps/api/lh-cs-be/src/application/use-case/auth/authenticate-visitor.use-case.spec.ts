import { UnauthorizedException } from '@nestjs/common';
import { AuthenticateVisitorUseCase } from './authenticate-visitor.use-case';
import { ConsultationService } from '../../service/consultation.service';
import { StatisticsService } from '../../service/statistics.service';
import { UserService } from '../../service/user.service';
import { VisitorAuthRequest } from '@/presentation/dto/request/visitor-auth.request';

describe('AuthenticateVisitorUseCase', () => {
  let useCase: AuthenticateVisitorUseCase;
  let consultationService: jest.Mocked<ConsultationService>;
  let statisticsService: jest.Mocked<StatisticsService>;
  let userService: jest.Mocked<UserService>;

  const baseRequest: VisitorAuthRequest = {
    consultationId: 'consultation-1',
    enterCode: 'ENTER1234',
    visitorId: 'visitor-uuid',
  };

  beforeEach(() => {
    consultationService = {
      findByEnterCode: jest.fn(),
      updateVisitorId: jest.fn(),
    } as unknown as jest.Mocked<ConsultationService>;

    statisticsService = {
      createConsultationLog: jest.fn(),
    } as unknown as jest.Mocked<StatisticsService>;

    userService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    useCase = new AuthenticateVisitorUseCase(
      consultationService,
      statisticsService,
      userService
    );
  });

  it('상담실을 찾을 수 없으면 예외를 발생시킨다', async () => {
    consultationService.findByEnterCode.mockResolvedValue(null);

    await expect(useCase.execute(baseRequest)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('상담실이 비활성 상태면 예외를 발생시킨다', async () => {
    consultationService.findByEnterCode.mockResolvedValue({
      id: baseRequest.consultationId,
      isActive: false,
      status: 'END',
    } as any);

    await expect(useCase.execute(baseRequest)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('방문자를 인증하고 상담사 정보를 반환한다', async () => {
    consultationService.findByEnterCode.mockResolvedValue({
      id: baseRequest.consultationId,
      isActive: true,
      status: 'IN_PROGRESS',
      visitorId: baseRequest.visitorId,
      tourId: 'tour-id',
      startTourFacilityId: 'facility-id',
      userId: 'counselor-id',
    } as any);
    userService.findById.mockResolvedValue({ name: '김상담' } as any);
    statisticsService.createConsultationLog.mockResolvedValue(undefined);

    const result = await useCase.execute(baseRequest);

    expect(consultationService.updateVisitorId).toHaveBeenCalledWith(
      baseRequest.consultationId,
      baseRequest.visitorId
    );
    expect(statisticsService.createConsultationLog).toHaveBeenCalledWith(
      expect.objectContaining({
        consultationId: baseRequest.consultationId,
        actionValue: baseRequest.visitorId,
      })
    );
    expect(result).toEqual({
      success: true,
      consultationId: baseRequest.consultationId,
      visitorId: baseRequest.visitorId,
      consultantName: '김상담',
      message: '상담실 입장 성공',
    });
  });
});
