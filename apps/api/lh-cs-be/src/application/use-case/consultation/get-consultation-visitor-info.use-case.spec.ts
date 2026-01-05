import { GetConsultationVisitorInfoUseCase } from './get-consultation-visitor-info.use-case';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '@/infrastructure/repository/entity/consultation.entity';
import { UpdateVisitorIdUseCase } from './update-visitor-id.use-case';
import { CustomException } from '@/common/exception/custom.exception';
import { generateVisitorId } from '@/common/utils/uuid-generator';

jest.mock('@/common/utils/uuid-generator', () => ({
  generateVisitorId: jest.fn(),
}));

const mockedGenerateVisitorId = generateVisitorId as jest.Mock;

const createConsultation = (
  overrides: Partial<ConsultationEntity> = {}
): ConsultationEntity =>
  ({
    id: '1',
    roomNumber: '1001',
    roomName: '84A',
    consultationCode: 'CONSULT_001',
    enterCode: '1234',
    status: ConsultationStatus.READY,
    isActive: true,
    user: { name: '홍길동' },
    tour: {
      tourCdnId: 'cdn',
      title: '84A',
      squareMeters: 84,
      imageUrl: 'image.png',
    },
    startTourFacility: {
      sceneId: '1',
      facility: { title: '거실' },
    },
    visitorId: null,
    consultingStartedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as ConsultationEntity;

describe('GetConsultationVisitorInfoUseCase', () => {
  let useCase: GetConsultationVisitorInfoUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let updateVisitorIdUseCase: jest.Mocked<UpdateVisitorIdUseCase>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    updateVisitorIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateVisitorIdUseCase>;

    useCase = new GetConsultationVisitorInfoUseCase(
      queryRepository,
      updateVisitorIdUseCase
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('visitorId가 없으면 생성 후 반환한다', async () => {
    mockedGenerateVisitorId.mockReturnValue('generated-visitor');
    queryRepository.findById.mockResolvedValue(createConsultation());

    const result = await useCase.execute('1');

    expect(updateVisitorIdUseCase.execute).toHaveBeenCalledWith(
      '1',
      'generated-visitor'
    );
    expect(result.visitorId).toBe('generated-visitor');
  });

  it('상담실이 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
