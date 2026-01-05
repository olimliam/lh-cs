import { GetRejectionHistoryUseCase } from './get-rejection-history.use-case';
import { UserRegistrationRejectionRepository } from '../../../infrastructure/repository/user-registration-rejection.repository';
import { UserRepository } from '../../../infrastructure/repository/user.repository';

describe('GetRejectionHistoryUseCase', () => {
  let useCase: GetRejectionHistoryUseCase;
  let rejectionRepository: jest.Mocked<UserRegistrationRejectionRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    rejectionRepository = {
      findAll: jest.fn(),
    } as any;

    userRepository = {
      findByIds: jest.fn(),
    } as any;

    useCase = new GetRejectionHistoryUseCase(
      rejectionRepository,
      userRepository
    );
  });

  it('거절 이력을 반환한다', async () => {
    const rejectedAt = new Date();
    rejectionRepository.findAll.mockResolvedValue({
      data: [
        {
          userId: '1',
          department: null,
          signedAt: rejectedAt,
          rejectedAt,
          rejectedBy: 'admin-1',
          reason: '사유',
        },
      ] as any,
      total: 1,
    });
    userRepository.findByIds.mockResolvedValue([
      { id: '1', username: 'user-1' },
      { id: 'admin-1', username: 'admin-user' },
    ] as any);

    const result = await useCase.execute(1, 20, undefined);

    expect(result.items[0]).toEqual({
      userId: '1',
      username: 'user-1',
      department: null,
      signedAt: rejectedAt,
      rejectedAt,
      rejectedBy: 'admin-user',
      reason: '사유',
    });
    expect(result.pagination.total).toBe(1);
    expect(userRepository.findByIds).toHaveBeenCalledWith(
      ['1', 'admin-1'],
      {
        includeDeleted: true,
      }
    );
  });

  it('신청자/거절자 username을 모두 매핑한다', async () => {
    const rejectedAt = new Date();
    rejectionRepository.findAll.mockResolvedValue({
      data: [
        {
          userId: '2',
          department: 'CS',
          signedAt: rejectedAt,
          rejectedAt,
          rejectedBy: 'admin-2',
          reason: '서류 미비',
        },
      ] as any,
      total: 1,
    });
    userRepository.findByIds.mockResolvedValue([
      { id: '2', username: 'user-2' },
      { id: 'admin-2', username: 'admin-two' },
    ] as any);

    const result = await useCase.execute(1, 10, undefined);

    expect(result.items[0]).toEqual({
      userId: '2',
      username: 'user-2',
      department: 'CS',
      signedAt: rejectedAt,
      rejectedAt,
      rejectedBy: 'admin-two',
      reason: '서류 미비',
    });
    expect(userRepository.findByIds).toHaveBeenCalledWith(['2', 'admin-2'], {
      includeDeleted: true,
    });
  });
});
