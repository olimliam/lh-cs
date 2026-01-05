import { BadRequestException } from '@nestjs/common';
import { CheckVisitorIdUseCase } from './check-visitor-id.use-case';
import { ConsultationService } from '../../service/consultation.service';

describe('CheckVisitorIdUseCase', () => {
  let useCase: CheckVisitorIdUseCase;
  let consultationService: jest.Mocked<ConsultationService>;

  beforeEach(() => {
    consultationService = {
      findActiveConsultationByVisitorId: jest.fn(),
    } as unknown as jest.Mocked<ConsultationService>;

    useCase = new CheckVisitorIdUseCase(consultationService);
  });

  it('유효하지 않은 UUID 형식이면 예외를 발생시킨다', async () => {
    await expect(
      useCase.execute('invalid-uuid', {} as any)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('활성 상담이 존재하면 해당 상담 정보를 포함해 반환한다', async () => {
    const visitorId = '11111111-1111-4111-8111-111111111111';
    consultationService.findActiveConsultationByVisitorId.mockResolvedValue({
      id: 'consult-id',
      status: 'IN_PROGRESS',
      consultantName: '홍상담',
    } as any);

    const result = await useCase.execute(visitorId, {} as any);

    expect(result).toEqual({
      success: true,
      visitorId,
      isExisting: true,
      consultationStatus: 'IN_PROGRESS',
      activeConsultationId: 'consult-id',
      message: '진행중인 상담이 있습니다 (상담사: 홍상담)',
    });
  });

  it('활성 상담이 없으면 유효한 visitor ID 메시지를 반환한다', async () => {
    const visitorId = '22222222-2222-4222-8222-222222222222';
    consultationService.findActiveConsultationByVisitorId.mockResolvedValue(
      null
    );

    const result = await useCase.execute(visitorId, {} as any);

    expect(result).toEqual({
      success: true,
      visitorId,
      isExisting: true,
      message: '유효한 visitor ID입니다',
    });
  });
});
