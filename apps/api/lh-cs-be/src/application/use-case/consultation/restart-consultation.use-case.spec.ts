import { RestartConsultationUseCase } from './restart-consultation.use-case';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
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
    status: ConsultationStatus.END,
    userId: 'user-1',
    tourId: 'tour-1',
    startTourFacilityId: 'facility-1',
    visitorId: 'visitor-1',
    consultingStartedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('RestartConsultationUseCase', () => {
  let useCase: RestartConsultationUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;
  let broadcastManager: jest.Mocked<BroadcastManagerService>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    commandRepository = {
      restartConsultation: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    broadcastManager = {
      broadcastConsultationRestarted: jest.fn(),
    } as unknown as jest.Mocked<BroadcastManagerService>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.restartConsultation.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);
    useCase = new RestartConsultationUseCase(
      queryRepository,
      commandRepository,
      readRepository,
      broadcastManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('END 상태 상담실을 재시작한다', async () => {
    await useCase.execute('consultation-1');

    expect(commandRepository.restartConsultation).toHaveBeenCalledWith(
      'consultation-1'
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        status: ConsultationStatus.READY,
        endRequestedAt: undefined,
      })
    );
    expect(
      broadcastManager.broadcastConsultationRestarted
    ).toHaveBeenCalledWith('consultation-1');
  });

  it('상담실을 찾을 수 없으면 예외를 발생시킨다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('consultation-1')).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_NOT_FOUND,
      })
    );
  });

  it('END 상태가 아니어도 재시작을 시도한다', async () => {
    queryRepository.findById.mockResolvedValue(
      createConsultationEntity({ status: ConsultationStatus.READY })
    );

    await useCase.execute('consultation-1');

    expect(commandRepository.restartConsultation).toHaveBeenCalledWith(
      'consultation-1'
    );
    expect(readRepository.updateReadModel).toHaveBeenCalled();
    expect(broadcastManager.broadcastConsultationRestarted).toHaveBeenCalled();
  });
});
