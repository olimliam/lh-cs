import { GetAllActiveConsultationsUseCase } from './get-all-active-consultations.use-case';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import { ReadConsultationEntity } from '@/infrastructure/repository/entity/read-consultation.entity';
import { ConsultationStatus } from '@/infrastructure/repository/entity/consultation.entity';
import { UserEntity, UserRoleEnum } from '@/infrastructure/repository/entity/user.entity';
import { CustomException } from '@/common/exception/custom.exception';

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
    visitorId: null,
    consultingStartedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    endRequestedAt: null,
    ...overrides,
  }) as ReadConsultationEntity;

const createUser = (role: UserRoleEnum): UserEntity =>
  ({
    id: '10',
    role,
  }) as UserEntity;

describe('GetAllActiveConsultationsUseCase', () => {
  let useCase: GetAllActiveConsultationsUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    queryRepository = {
      findActiveByUserIdFromReadModel: jest.fn(),
      findAllActiveFromReadModel: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new GetAllActiveConsultationsUseCase(
      queryRepository,
      userRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('일반 사용자는 본인 상담실만 조회한다', async () => {
    userRepository.findById.mockResolvedValue(createUser(UserRoleEnum.USER));
    const consultations = [createReadConsultation()];
    queryRepository.findActiveByUserIdFromReadModel.mockResolvedValue(
      consultations
    );

    const result = await useCase.execute('10');

    expect(
      queryRepository.findActiveByUserIdFromReadModel
    ).toHaveBeenCalledWith('10');
    expect(queryRepository.findAllActiveFromReadModel).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('ADMIN 사용자는 모든 상담실을 조회한다', async () => {
    userRepository.findById.mockResolvedValue(createUser(UserRoleEnum.ADMIN));
    const consultations = [createReadConsultation({ id: '2' })];
    queryRepository.findAllActiveFromReadModel.mockResolvedValue(
      consultations
    );

    const result = await useCase.execute('11');

    expect(queryRepository.findAllActiveFromReadModel).toHaveBeenCalled();
    expect(
      queryRepository.findActiveByUserIdFromReadModel
    ).not.toHaveBeenCalled();
    expect(result[0].id).toBe('2');
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toBeInstanceOf(
      CustomException
    );
  });
});
