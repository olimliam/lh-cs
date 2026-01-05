import { FindActiveConsultationByVisitorIdUseCase } from './find-active-consultation-by-visitor-id.use-case';
import { ReadConsultationRepository } from '@/infrastructure/repository/query/read-consultation.repository';
import { ReadConsultationEntity } from '@/infrastructure/repository/entity/read-consultation.entity';
import { ConsultationStatus } from '@/infrastructure/repository/entity/consultation.entity';

const createReadConsultation = (
  overrides: Partial<ReadConsultationEntity> = {}
): ReadConsultationEntity =>
  ({
    id: '1',
    roomNumber: '1001',
    roomName: '84A',
    consultationCode: 'CONSULT_001',
    enterCode: '1234',
    status: ConsultationStatus.READY,
    isActive: true,
    userId: '10',
    consultantId: '10',
    consultantName: '홍길동',
    consultantUsername: 'hong',
    tourId: '20',
    tourCdnId: 'cdn-001',
    tourImageUrl: 'image.png',
    tourTitle: '84A',
    tourSquareMeters: 84,
    tourFacilityId: '30',
    facilityId: '40',
    facilityTitle: '거실',
    facilityCameraPosX: 0,
    facilityCameraPosY: 0,
    facilityCameraPosZ: 0,
    facilitySceneId: '50',
    startFacilitySceneId: '60',
    visitorId: 'visitor-1',
    consultingStartedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    endRequestedAt: null,
    ...overrides,
  }) as ReadConsultationEntity;

describe('FindActiveConsultationByVisitorIdUseCase', () => {
  let useCase: FindActiveConsultationByVisitorIdUseCase;
  let readRepository: jest.Mocked<ReadConsultationRepository>;

  beforeEach(() => {
    readRepository = {
      findActiveConsultationByVisitorId: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    useCase = new FindActiveConsultationByVisitorIdUseCase(readRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('visitorId로 활성 상담실을 조회한다', async () => {
    readRepository.findActiveConsultationByVisitorId.mockResolvedValue(
      createReadConsultation()
    );

    const result = await useCase.execute('visitor-1');

    expect(result?.visitorId).toBe('visitor-1');
  });

  it('오류 발생 시 null을 반환한다', async () => {
    readRepository.findActiveConsultationByVisitorId.mockRejectedValue(
      new Error('db')
    );

    const result = await useCase.execute('visitor-1');

    expect(result).toBeNull();
  });
});
