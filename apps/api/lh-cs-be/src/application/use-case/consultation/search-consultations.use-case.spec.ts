import { SearchConsultationsUseCase } from './search-consultations.use-case';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '@/infrastructure/repository/entity/consultation.entity';
import { SearchConsultationQuery } from '@/application/dto/query';
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

describe('SearchConsultationsUseCase', () => {
  let useCase: SearchConsultationsUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  const searchDto: SearchConsultationQuery = {
    userId: '1',
  };

  beforeEach(() => {
    queryRepository = {
      search: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    useCase = new SearchConsultationsUseCase(queryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('검색 조건에 맞는 상담실을 반환한다', async () => {
    queryRepository.search.mockResolvedValue([createConsultation()]);

    const result = await useCase.execute(searchDto);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('검색 실패 시 예외를 던진다', async () => {
    queryRepository.search.mockRejectedValue(new Error('db error'));

    await expect(useCase.execute(searchDto)).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
