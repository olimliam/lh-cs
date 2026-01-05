import { UpdateConsultationStatusUseCase } from './update-consultation-status.use-case';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../../infrastructure/repository/entity/consultation.entity';

const createConsultationEntity = (
  overrides: Partial<ConsultationEntity> = {}
): ConsultationEntity =>
  ({
    id: 'consultation-1',
    status: ConsultationStatus.READY,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('UpdateConsultationStatusUseCase', () => {
  let useCase: UpdateConsultationStatusUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    commandRepository = {
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.updateStatus.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);

    useCase = new UpdateConsultationStatusUseCase(
      queryRepository,
      commandRepository,
      readRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('상담 상태를 업데이트한다', async () => {
    await useCase.execute('consultation-1', ConsultationStatus.END);

    expect(commandRepository.updateStatus).toHaveBeenCalledWith(
      'consultation-1',
      ConsultationStatus.END
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        status: ConsultationStatus.END,
      })
    );
  });

  it('상담실이 없으면 업데이트하지 않는다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await useCase.execute('consultation-1', ConsultationStatus.END);

    expect(commandRepository.updateStatus).not.toHaveBeenCalled();
    expect(readRepository.updateReadModel).not.toHaveBeenCalled();
  });

  it('읽기 모델 업데이트 실패는 무시해야 한다', async () => {
    readRepository.updateReadModel.mockRejectedValue(new Error('read error'));

    await useCase.execute('consultation-1', ConsultationStatus.CONSULTING);

    expect(commandRepository.updateStatus).toHaveBeenCalled();
  });
});
