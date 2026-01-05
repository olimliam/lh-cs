import { StartConsultationUseCase } from './start-consultation.use-case';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
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
    visitorId: null,
    consultingStartedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    histories: [],
    readConsultation: null,
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('StartConsultationUseCase', () => {
  let useCase: StartConsultationUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    commandRepository = {
      assignVisitor: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.assignVisitor.mockResolvedValue(undefined);
    commandRepository.updateStatus.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);

    useCase = new StartConsultationUseCase(
      queryRepository,
      commandRepository,
      readRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('READY 상태의 상담실을 상담중으로 변경한다', async () => {
    await useCase.execute('consultation-1', { visitorId: 'visitor-1' } as any);

    expect(commandRepository.assignVisitor).toHaveBeenCalledWith(
      'consultation-1',
      'visitor-1'
    );
    expect(commandRepository.updateStatus).toHaveBeenCalledWith(
      'consultation-1',
      ConsultationStatus.CONSULTING
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        visitorId: 'visitor-1',
        status: ConsultationStatus.CONSULTING,
      })
    );
  });

  it('상담실을 찾을 수 없으면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('consultation-1', { visitorId: 'visitor-1' } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_NOT_FOUND,
      })
    );
  });

  it('READY가 아닌 상태면 예외를 던진다', async () => {
    queryRepository.findById.mockResolvedValue(
      createConsultationEntity({ status: ConsultationStatus.END })
    );

    await expect(
      useCase.execute('consultation-1', { visitorId: 'visitor-1' } as any)
    ).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.CONSULTATION_INVALID_STATUS,
      })
    );
  });

  it('읽기 모델 업데이트가 실패해도 예외를 던지지 않아야 함', async () => {
    readRepository.updateReadModel.mockRejectedValue(new Error('read error'));

    await expect(
      useCase.execute('consultation-1', { visitorId: 'visitor-1' } as any)
    ).resolves.toBeUndefined();
  });
});
