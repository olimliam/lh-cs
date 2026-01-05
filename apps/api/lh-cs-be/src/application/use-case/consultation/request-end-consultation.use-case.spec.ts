import { RequestEndConsultationUseCase } from './request-end-consultation.use-case';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { StatisticsService } from '../../service/statistics.service';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
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
    status: ConsultationStatus.CONSULTING,
    userId: 'user-1',
    tourId: 'tour-1',
    startTourFacilityId: 'facility-1',
    visitorId: 'visitor-1',
    endRequestedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('RequestEndConsultationUseCase', () => {
  let useCase: RequestEndConsultationUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;
  let statisticsService: jest.Mocked<StatisticsService>;
  let broadcastManager: jest.Mocked<BroadcastManagerService>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    commandRepository = {
      requestEndConsultation: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    statisticsService = {
      createConsultationLog: jest.fn(),
    } as unknown as jest.Mocked<StatisticsService>;

    broadcastManager = {
      broadcastConsultationEnding: jest.fn(),
    } as unknown as jest.Mocked<BroadcastManagerService>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.requestEndConsultation.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);
    statisticsService.createConsultationLog.mockResolvedValue(undefined);
    useCase = new RequestEndConsultationUseCase(
      queryRepository,
      commandRepository,
      readRepository,
      statisticsService,
      broadcastManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('상담 종료 요청을 처리하고 브로드캐스트한다', async () => {
    await useCase.execute('consultation-1');

    expect(commandRepository.requestEndConsultation).toHaveBeenCalledWith(
      'consultation-1',
      expect.any(Date)
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        status: ConsultationStatus.END,
        endRequestedAt: expect.any(Date),
      })
    );
    expect(
      broadcastManager.broadcastConsultationEnding
    ).toHaveBeenCalledWith('consultation-1');
  });

  it('상담실을 찾을 수 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('consultation-1')).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_NOT_FOUND,
      })
    );
  });

  it('이미 END 상태면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(
      createConsultationEntity({ status: ConsultationStatus.END })
    );

    await expect(useCase.execute('consultation-1')).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_ALREADY_ENDED,
      })
    );
  });

  it('상담 종료 로그 작성 실패 시에도 요청을 계속 진행해야 함', async () => {
    statisticsService.createConsultationLog.mockRejectedValue(
      new Error('log error')
    );

    await useCase.execute('consultation-1');

    expect(commandRepository.requestEndConsultation).toHaveBeenCalled();
    expect(
      broadcastManager.broadcastConsultationEnding
    ).toHaveBeenCalledWith('consultation-1');
  });
});
