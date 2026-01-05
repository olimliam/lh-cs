import { CreateConsultationUseCase } from './create-consultation.use-case';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { ConsultationCodeGenerator } from '../../../common/utils/consultation-code-generator';
import { StatisticsService } from '../../service/statistics.service';
import { ConsultationResponse } from '@/presentation/dto/response/consultation.response';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../../infrastructure/repository/entity/consultation.entity';
import { ConsultationErrorCode } from '@/common/exception/error';

const createConsultationEntity = (
  overrides: Partial<ConsultationEntity> = {}
): ConsultationEntity =>
  ({
    id: 'consultation-1',
    roomNumber: '101',
    consultationCode: 'CONSULT_001',
    enterCode: 'ABCD',
    status: ConsultationStatus.READY,
    isActive: true,
    userId: 'user-1',
    tourId: 'tour-1',
    startTourFacilityId: 'facility-1',
    user: { name: '홍길동' },
    tour: {
      tourCdnId: 'cdn-1',
      title: '투어 제목',
      squareMeters: 84,
      imageUrl: 'image-url',
    },
    startTourFacility: {
      sceneId: 'scene-1',
      facility: { title: '시설 제목' },
    },
    visitorId: 'visitor-1',
    consultingStartedAt: undefined,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    histories: [],
    readConsultation: null,
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('CreateConsultationUseCase', () => {
  let useCase: CreateConsultationUseCase;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;
  let codeGenerator: jest.Mocked<ConsultationCodeGenerator>;
  let statisticsService: jest.Mocked<StatisticsService>;

  const mockResponse = {
    id: 'consultation-1',
    status: ConsultationStatus.READY,
  } as unknown as ConsultationResponse;

  beforeEach(() => {
    commandRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    queryRepository = {
      findById: jest.fn(),
      findByConsultationCode: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    readRepository = {
      createReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    codeGenerator = {
      generateRoomNumber: jest.fn(),
      generateEnterCode: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCodeGenerator>;

    statisticsService = {
      createConsultationLog: jest.fn(),
    } as unknown as jest.Mocked<StatisticsService>;

    jest
      .spyOn(ConsultationResponse, 'fromEntity')
      .mockReturnValue(mockResponse);

    commandRepository.create.mockResolvedValue({ id: 'consultation-1' } as any);
    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    queryRepository.findByConsultationCode.mockResolvedValue(null);
    readRepository.createReadModel.mockResolvedValue(undefined);
    statisticsService.createConsultationLog.mockResolvedValue(undefined);
    codeGenerator.generateRoomNumber.mockReturnValue('200');
    codeGenerator.generateEnterCode.mockReturnValue('ZXCV');

    useCase = new CreateConsultationUseCase(
      commandRepository,
      queryRepository,
      readRepository,
      codeGenerator,
      statisticsService
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('상담실 생성에 성공하면 생성된 상담실을 반환한다', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      tourId: 'tour-1',
      startTourFacilityId: 'facility-1',
      consultationCode: 'UNIQUE_CODE',
    } as any);

    expect(commandRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        consultationCode: 'UNIQUE_CODE',
        roomNumber: '200',
        enterCode: 'ZXCV',
      })
    );
    expect(queryRepository.findById).toHaveBeenCalledWith('consultation-1');
    expect(readRepository.createReadModel).toHaveBeenCalled();
    expect(statisticsService.createConsultationLog).toHaveBeenCalledWith(
      expect.objectContaining({
        consultationId: 'consultation-1',
        counselorId: 'user-1',
      })
    );
    expect(result).toBe(mockResponse);
  });

  it('생성 후 상담실을 찾을 수 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      consultationCode: 'UNIQUE_CODE',
    } as any)).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_NOT_FOUND,
      })
    );
  });

  it('알 수 없는 오류가 발생하면 생성 실패 예외를 던진다', async () => {
    commandRepository.create.mockRejectedValue(new Error('db error'));

    await expect(useCase.execute({
      consultationCode: 'UNIQUE_CODE',
    } as any)).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_CREATE_FAILED,
      })
    );
  });

  it('읽기 모델 생성이 실패해도 상담실 생성은 성공해야 함', async () => {
    readRepository.createReadModel.mockRejectedValue(new Error('read error'));

    const result = await useCase.execute({
      userId: 'user-1',
      tourId: 'tour-1',
      startTourFacilityId: 'facility-1',
      consultationCode: 'UNIQUE_CODE',
    } as any);

    expect(result).toBe(mockResponse);
    expect(readRepository.createReadModel).toHaveBeenCalledTimes(1);
  });

  it('중복 상담 코드 입력 시 사용자 정의 예외를 던진다', async () => {
    queryRepository.findByConsultationCode.mockResolvedValue(
      createConsultationEntity({ consultationCode: 'DUPLICATE' })
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        tourId: 'tour-1',
        startTourFacilityId: 'facility-1',
        consultationCode: 'DUPLICATE',
      } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_CODE_ALREADY_IN_USE,
      })
    );
  });
});
