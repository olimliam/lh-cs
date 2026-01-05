import { FinalizeEndConsultationUseCase } from './finalize-end-consultation.use-case';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { StatisticsService } from '../../service/statistics.service';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import { ConsultationErrorCode } from '@/common/exception/error';
import { EntityManager } from 'typeorm';
import { ZoomVideoSdkService } from '@/application/zoom/zoom-video-sdk.service';

describe('FinalizeEndConsultationUseCase', () => {
  let useCase: FinalizeEndConsultationUseCase;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;
  let statisticsService: jest.Mocked<StatisticsService>;
  let broadcastManager: jest.Mocked<BroadcastManagerService>;
  let zoomVideoSdkService: jest.Mocked<ZoomVideoSdkService>;

  beforeEach(() => {
    commandRepository = {
      finalizeEndConsultation: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    statisticsService = {
      createConsultationLog: jest.fn(),
    } as unknown as jest.Mocked<StatisticsService>;

    broadcastManager = {
      broadcastConsultationEnded: jest.fn(),
    } as unknown as jest.Mocked<BroadcastManagerService>;

    zoomVideoSdkService = {
      closeSessionsByConsultation: jest.fn(),
    } as unknown as jest.Mocked<ZoomVideoSdkService>;

    commandRepository.finalizeEndConsultation.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);
    statisticsService.createConsultationLog.mockResolvedValue(undefined);
    zoomVideoSdkService.closeSessionsByConsultation.mockResolvedValue({
      closedSessionIds: [],
    });
    useCase = new FinalizeEndConsultationUseCase(
      commandRepository,
      readRepository,
      statisticsService,
      broadcastManager,
      zoomVideoSdkService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('상담 완전 종료를 처리한다', async () => {
    const em = {} as unknown as EntityManager; // 최소 목

    await useCase.execute(em, 'consultation-1', 'user-1');

    expect(commandRepository.finalizeEndConsultation).toHaveBeenCalledWith(
      em,
      'consultation-1'
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        isActive: false,
      }),
      em // update 모델은 em이 필수가 아니므로
    );
    expect(statisticsService.createConsultationLog).toHaveBeenCalledWith(
      expect.objectContaining({
        consultationId: 'consultation-1',
        counselorId: 'user-1',
      })
    );
    expect(zoomVideoSdkService.closeSessionsByConsultation).toHaveBeenCalledWith(
      'consultation-1'
    );
    expect(broadcastManager.broadcastConsultationEnded).toHaveBeenCalledWith(
      'consultation-1'
    );
  });

  it('완전 종료 중 오류가 발생하면 예외를 던진다', async () => {
    commandRepository.finalizeEndConsultation.mockRejectedValue(
      new Error('db error')
    );

    const em = {} as unknown as EntityManager; // 최소 목

    await expect(useCase.execute(em, 'consultation-1')).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_END_FAILED,
      })
    );
  });
});
