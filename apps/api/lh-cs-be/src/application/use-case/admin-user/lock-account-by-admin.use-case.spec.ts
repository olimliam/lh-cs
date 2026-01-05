import { NotFoundException } from '@nestjs/common';
import { LockAccountByAdminUseCase } from './lock-account-by-admin.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { ConfigService } from '@nestjs/config';
import { UserLockStatusEnum } from '@/infrastructure/repository/entity';

describe('LockAccountByAdminUseCase', () => {
  let useCase: LockAccountByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let configService: jest.Mocked<ConfigService>;

  const now = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);

    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string, defaultValue: any) => defaultValue),
    } as any;

    useCase = new LockAccountByAdminUseCase(userRepository, configService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('계정을 잠그고 잠금 만료 시간을 설정한다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      loginAttemptCount: 0,
    } as any);
    userRepository.update.mockResolvedValue({ id: 'user-1' } as any);

    await useCase.execute('user-1', 60);

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        lockState: UserLockStatusEnum.LOCKED,
        lockReason: 'Locked by admin',
      })
    );
  });
});
