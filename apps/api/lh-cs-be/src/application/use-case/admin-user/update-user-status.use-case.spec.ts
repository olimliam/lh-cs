import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserStatusEnum } from '@/infrastructure/repository/entity';
import { UpdateUserStatusUseCase } from './update-user-status.use-case';

describe('UpdateUserStatusUseCase', () => {
  let useCase: UpdateUserStatusUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateUserStatusUseCase(userRepository);
  });

  it('사용자 상태를 INACTIVE로 변경하며 inactiveAt을 기록한다', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    jest.useFakeTimers().setSystemTime(now);

    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      status: UserStatusEnum.ACTIVE,
    } as any);
    userRepository.update.mockResolvedValue({ id: 'user-1' } as any);

    const result = await useCase.execute('user-1', UserStatusEnum.INACTIVE);

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      status: UserStatusEnum.INACTIVE,
      inactiveAt: now,
    });
    expect(result).toEqual({ id: 'user-1' });

    jest.useRealTimers();
  });

  it('INACTIVE에서 ACTIVE로 변경 시 inactiveAt을 비운다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-2',
      status: UserStatusEnum.INACTIVE,
    } as any);
    userRepository.update.mockResolvedValue({ id: 'user-2' } as any);

    await useCase.execute('user-2', UserStatusEnum.ACTIVE);

    expect(userRepository.update).toHaveBeenCalledWith('user-2', {
      status: UserStatusEnum.ACTIVE,
      inactiveAt: null,
    });
  });

  it('업데이트 실패 시 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      status: UserStatusEnum.ACTIVE,
    } as any);
    userRepository.update.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', UserStatusEnum.INACTIVE)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('대상 사용자가 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', UserStatusEnum.ACTIVE)
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
