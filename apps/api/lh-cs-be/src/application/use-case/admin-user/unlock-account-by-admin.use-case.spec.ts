import { NotFoundException } from '@nestjs/common';
import { UnlockAccountByAdminUseCase } from './unlock-account-by-admin.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserLockStatusEnum } from '@/infrastructure/repository/entity';

describe('UnlockAccountByAdminUseCase', () => {
  let useCase: UnlockAccountByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UnlockAccountByAdminUseCase(userRepository);
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('계정 잠금을 해제한다', async () => {
    userRepository.findById.mockResolvedValue({ id: 'user-1' } as any);
    userRepository.update.mockResolvedValue({ id: 'user-1' } as any);

    const result = await useCase.execute('user-1');

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      lockedUntil: null,
      lockAt: null,
      loginAttemptCount: 0,
      lockReason: 'Unlocked by admin',
      lockState: UserLockStatusEnum.UNLOCKED,
    });
    expect(result).toEqual({ id: 'user-1' });
  });
});
