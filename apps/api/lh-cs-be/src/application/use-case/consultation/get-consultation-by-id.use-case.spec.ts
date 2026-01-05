import { GetConsultationByIdUseCase } from './get-consultation-by-id.use-case';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '@/infrastructure/repository/entity/consultation.entity';
import { CustomException } from '@/common/exception/custom.exception';

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

describe('GetConsultationByIdUseCase', () => {
  let useCase: GetConsultationByIdUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    useCase = new GetConsultationByIdUseCase(queryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('상담실 상세 정보를 반환한다', async () => {
    queryRepository.findById.mockResolvedValue(createConsultation());

    const result = await useCase.execute('1');

    expect(result.id).toBe('1');
  });

  it('상담실이 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
