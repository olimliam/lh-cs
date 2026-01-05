import { UpdateConsultationStatusByConnectionUseCase } from './update-consultation-status-by-connection.use-case';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../../infrastructure/repository/entity/consultation.entity';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

const createConsultationEntity = (
  overrides: Partial<ConsultationEntity> = {}
): ConsultationEntity =>
  ({
    id: 'consultation-1',
    status: ConsultationStatus.READY,
    isActive: true,
    userId: 'user-1',
    tourId: 'tour-1',
    startTourFacilityId: 'facility-1',
    visitorId: 'visitor-1',
    consultingStartedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('UpdateConsultationStatusByConnectionUseCase', () => {
  let useCase: UpdateConsultationStatusByConnectionUseCase;
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
      requestEndConsultation: jest.fn(),
      updateStatusAndStartTime: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    broadcastManager = {
      broadcastConsultationEnding: jest.fn(),
    } as unknown as jest.Mocked<BroadcastManagerService>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.restartConsultation.mockResolvedValue(undefined);
    commandRepository.requestEndConsultation.mockResolvedValue(undefined);
    commandRepository.updateStatusAndStartTime.mockResolvedValue(undefined);
    commandRepository.updateStatus.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);
    useCase = new UpdateConsultationStatusByConnectionUseCase(
      queryRepository,
      commandRepository,
      readRepository,
      broadcastManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('새로운 상태로 전환하고 상태를 반환한다', async () => {
    const result = await useCase.execute('consultation-1', true, true);

    expect(commandRepository.updateStatusAndStartTime).toHaveBeenCalledWith(
      'consultation-1',
      ConsultationStatus.CONSULTING,
      expect.any(Date)
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        status: ConsultationStatus.CONSULTING,
      })
    );
    expect(result).toEqual({
      data: ConsultationStatus.CONSULTING,
      message: '상담실 상태 업데이트 성공',
    });
  });

  it('MANAGER가 이탈하면 종료 요청을 전송한다', async () => {
    queryRepository.findById.mockResolvedValue(
      createConsultationEntity({ status: ConsultationStatus.CONSULTING })
    );

    const result = await useCase.execute('consultation-1', false, true);

    expect(commandRepository.requestEndConsultation).toHaveBeenCalledWith(
      'consultation-1',
      expect.any(Date)
    );
    expect(
      broadcastManager.broadcastConsultationEnding
    ).toHaveBeenCalledWith('consultation-1');
    expect(result).toEqual({
      data: ConsultationStatus.END,
      message: '상담실 상태 업데이트 성공',
    });
  });

  it('상태가 변경되지 않으면 현재 상태를 반환한다', async () => {
    const existing = createConsultationEntity({
      status: ConsultationStatus.READY,
    });
    queryRepository.findById.mockResolvedValue(existing);

    const result = await useCase.execute('consultation-1', true, false);

    expect(commandRepository.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: ConsultationStatus.READY,
      message: '상담실 상태가 변경되지 않았습니다.',
    });
  });

  it('상담실이 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('consultation-1', true, true)
    ).rejects.toBeInstanceOf(CustomException);
  });

  it('END에서 READY로 전환 시 재시작 로직을 호출한다', async () => {
    queryRepository.findById.mockResolvedValue(
      createConsultationEntity({ status: ConsultationStatus.END })
    );

    await useCase.execute('consultation-1', true, false);

    expect(commandRepository.restartConsultation).toHaveBeenCalledWith(
      'consultation-1'
    );
  });
});
