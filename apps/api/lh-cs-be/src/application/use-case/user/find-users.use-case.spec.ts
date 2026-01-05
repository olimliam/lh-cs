import { FindUsersUseCase } from './find-users.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { UserRoleEnum, UserStatusEnum } from '@/infrastructure/repository/entity';

describe('FindUsersUseCase', () => {
  let useCase: FindUsersUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  beforeEach(() => {
    userRepository = {
      findAll: jest.fn(),
      countStatusAndLockStates: jest.fn(),
    } as any;

    phoneEncryptionService = {
      hash: jest.fn().mockReturnValue('hashed-phone'),
    } as any;

    useCase = new FindUsersUseCase(userRepository, phoneEncryptionService);
  });

  it('사용자 목록과 페이지 정보를 반환한다', async () => {
    const summary = { activeCount: 10, inactiveCount: 5, deletedCount: 1, lockedCount: 1 };
    userRepository.findAll.mockResolvedValue({
      users: [{ id: 'user-1' } as any],
      total: 25,
    });
    userRepository.countStatusAndLockStates.mockResolvedValue(summary);

    const result = await useCase.execute({ limit: 10, page: 2 });

    expect(result).toEqual({
      users: [{ id: 'user-1' }],
      total: 25,
      totalPages: 3,
      summary: { activeCount: 9, inactiveCount: 5, lockedCount: 1 },
    });
    expect(userRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeStatuses: [UserStatusEnum.WAIT, UserStatusEnum.DELETED],
      })
    );
  });

  it('전화번호가 주어지면 해시를 이용해 조회한다', async () => {
    const summary = { activeCount: 0, inactiveCount: 0, deletedCount: 0, lockedCount: 0 };
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });
    userRepository.countStatusAndLockStates.mockResolvedValue(summary);

    await useCase.execute({ phoneNumber: '010-1234-5678' });

    expect(phoneEncryptionService.hash).toHaveBeenCalled();
    expect(userRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ phoneHash: 'hashed-phone' })
    );
    expect(userRepository.countStatusAndLockStates).toHaveBeenCalledWith(
      expect.objectContaining({ phoneHash: 'hashed-phone' })
    );
  });

  it('요청 필터에 status, statuses가 있으면 요약 계산에도 동일하게 반영한다', async () => {
    const summary = { activeCount: 0, inactiveCount: 0, deletedCount: 0, lockedCount: 0 };
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });
    userRepository.countStatusAndLockStates.mockResolvedValue(summary);

    await useCase.execute({
      status: UserStatusEnum.ACTIVE,
      statuses: [UserStatusEnum.DELETED],
      roles: [UserRoleEnum.CONSULTANT],
    });

    expect(userRepository.countStatusAndLockStates).toHaveBeenCalled();

    const callLength = userRepository.countStatusAndLockStates.mock.calls.length;
    const countArgs =
      callLength > 0
        ? userRepository.countStatusAndLockStates.mock.calls[callLength - 1][0]
        : undefined;

    expect(countArgs?.roles).toEqual([UserRoleEnum.CONSULTANT]);
    expect(countArgs?.status).toBe(UserStatusEnum.ACTIVE);
    expect(countArgs?.statuses).toEqual([UserStatusEnum.DELETED]);
    expect(countArgs?.excludeStatuses).toBeUndefined();
  });

  it('WAIT/DELETED 사용자는 기본 조회와 요약 집계에서 동일하게 제외한다', async () => {
    const summary = { activeCount: 2, inactiveCount: 0, deletedCount: 0, lockedCount: 0 };
    userRepository.findAll.mockResolvedValue({
      users: [
        { id: 'user-1', status: UserStatusEnum.ACTIVE } as any,
        { id: 'user-2', status: UserStatusEnum.WAIT } as any,
      ],
      total: 2,
    });
    userRepository.countStatusAndLockStates.mockResolvedValue(summary);

    await useCase.execute();

    expect(userRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeStatuses: [UserStatusEnum.WAIT, UserStatusEnum.DELETED],
      })
    );
    expect(userRepository.countStatusAndLockStates).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeStatuses: [UserStatusEnum.WAIT, UserStatusEnum.DELETED],
      })
    );
  });
});
