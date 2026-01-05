import { FindConsultationByEnterCodeUseCase } from './find-consultation-by-enter-code.use-case';
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

describe('FindConsultationByEnterCodeUseCase', () => {
  let useCase: FindConsultationByEnterCodeUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;

  beforeEach(() => {
    queryRepository = {
      findByEnterCode: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    useCase = new FindConsultationByEnterCodeUseCase(queryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('입장 코드로 상담실을 조회한다', async () => {
    queryRepository.findByEnterCode.mockResolvedValue(createConsultation());

    const result = await useCase.execute('1234');

    expect(result.enterCode).toBe('1234');
  });

  it('상담실이 없으면 예외를 던진다', async () => {
    queryRepository.findByEnterCode.mockResolvedValue(null);

    await expect(useCase.execute('0000')).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
