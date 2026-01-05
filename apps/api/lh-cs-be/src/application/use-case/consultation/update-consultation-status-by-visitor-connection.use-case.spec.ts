import { UpdateConsultationStatusByVisitorConnectionUseCase } from './update-consultation-status-by-visitor-connection.use-case';
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
    userId: 'user-1',
    tourId: 'tour-1',
    startTourFacilityId: 'facility-1',
    visitorId: null,
    consultingStartedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as ConsultationEntity;

describe('UpdateConsultationStatusByVisitorConnectionUseCase', () => {
  let useCase: UpdateConsultationStatusByVisitorConnectionUseCase;
  let queryRepository: jest.Mocked<ConsultationQueryRepository>;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;

  beforeEach(() => {
    queryRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ConsultationQueryRepository>;

    commandRepository = {
      updateStatus: jest.fn(),
      updateStatusAndStartTime: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateReadModel: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    queryRepository.findById.mockResolvedValue(createConsultationEntity());
    commandRepository.updateStatus.mockResolvedValue(undefined);
    commandRepository.updateStatusAndStartTime.mockResolvedValue(undefined);
    readRepository.updateReadModel.mockResolvedValue(undefined);

    useCase = new UpdateConsultationStatusByVisitorConnectionUseCase(
      queryRepository,
      commandRepository,
      readRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('상담사와 방문자가 모두 연결되면 상담을 시작한다', async () => {
    await useCase.execute('consultation-1', true, true);

    expect(commandRepository.updateStatusAndStartTime).toHaveBeenCalledWith(
      'consultation-1',
      ConsultationStatus.CONSULTING,
      expect.any(Date)
    );
    expect(readRepository.updateReadModel).toHaveBeenCalledWith(
      'consultation-1',
      expect.objectContaining({
        status: ConsultationStatus.CONSULTING,
        consultingStartedAt: expect.any(Date),
      })
    );
  });

  it('상담실이 없으면 아무 작업도 하지 않는다', async () => {
    queryRepository.findById.mockResolvedValue(null);

    await useCase.execute('consultation-1', true, false);
    expect(commandRepository.updateStatus).not.toHaveBeenCalled();
    expect(readRepository.updateReadModel).not.toHaveBeenCalled();
  });

  it('연결 상태에 따라 READY 상태로만 유지될 수 있다', async () => {
    await useCase.execute('consultation-1', true, false);

    expect(commandRepository.updateStatus).toHaveBeenCalledWith(
      'consultation-1',
      ConsultationStatus.READY
    );
    expect(commandRepository.updateStatusAndStartTime).not.toHaveBeenCalled();
  });
});
