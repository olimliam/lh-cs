import { UpdateVisitorIdUseCase } from './update-visitor-id.use-case';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { ConsultationErrorCode } from '@/common/exception/error';

describe('UpdateVisitorIdUseCase', () => {
  let useCase: UpdateVisitorIdUseCase;
  let commandRepository: jest.Mocked<ConsultationCommandRepository>;
  let readRepository: jest.Mocked<ReadConsultationRepository>;

  beforeEach(() => {
    commandRepository = {
      updateVisitorId: jest.fn(),
    } as unknown as jest.Mocked<ConsultationCommandRepository>;

    readRepository = {
      updateVisitorId: jest.fn(),
    } as unknown as jest.Mocked<ReadConsultationRepository>;

    commandRepository.updateVisitorId.mockResolvedValue(undefined);
    readRepository.updateVisitorId.mockResolvedValue(undefined);

    useCase = new UpdateVisitorIdUseCase(commandRepository, readRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('방문자 ID를 업데이트한다', async () => {
    await useCase.execute('consultation-1', 'visitor-2');

    expect(commandRepository.updateVisitorId).toHaveBeenCalledWith(
      'consultation-1',
      'visitor-2'
    );
    expect(readRepository.updateVisitorId).toHaveBeenCalledWith(
      'consultation-1',
      'visitor-2'
    );
  });

  it('업데이트 실패 시 예외를 던진다', async () => {
    commandRepository.updateVisitorId.mockRejectedValue(new Error('db error'));

    await expect(
      useCase.execute('consultation-1', 'visitor-2')
    ).rejects.toEqual(
      expect.objectContaining({
        code: ConsultationErrorCode.VISITOR_ASSIGN_FAILED,
      })
    );
  });
});
