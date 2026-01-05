import { NotFoundException } from '@nestjs/common';
import { InactivateUserUseCase } from './inactivate-user.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('random')),
}));

describe('InactivateUserUseCase', () => {
  let useCase: InactivateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    phoneEncryptionService = {
      hash: jest.fn().mockReturnValue('hashed-random'),
    } as any;

    useCase = new InactivateUserUseCase(userRepository, phoneEncryptionService);
  });

  it('사용자를 INACTIVE로 전환하고 개인정보를 비식별화한다', async () => {
    const now = new Date('2024-04-01T00:00:00Z');
    jest.useFakeTimers().setSystemTime(now);

    const user: any = {
      id: '42',
      status: UserStatusEnum.ACTIVE,
      username: 'keep-me',
    };

    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({
        ...user,
        status: UserStatusEnum.INACTIVE,
        username: 'keep-me',
        name: '중지된 사용자',
        inactiveAt: now,
      });

    const result = await useCase.execute('42');

    expect(userRepository.update).toHaveBeenCalledWith('42', {
      status: UserStatusEnum.INACTIVE,
      inactiveAt: now,
      phoneHash: 'hashed-random',
      phoneEncrypted: null,
      phoneIv: null,
      phoneTag: null,
      phoneVerifiedAt: null,
      name: '중지된 사용자',
      department: null,
      profileImageUrl: null,
      loginAttemptCount: 0,
      lockedUntil: null,
    });
    expect(
      (userRepository.update.mock.calls[0]?.[1] as any).username
    ).toBeUndefined();
    expect(phoneEncryptionService.hash).toHaveBeenCalledWith('72616e646f6d');
    expect(result).toMatchObject({
      status: UserStatusEnum.INACTIVE,
      username: 'keep-me',
      name: '중지된 사용자',
      inactiveAt: now,
    });

    jest.useRealTimers();
  });

  it('대상 사용자가 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('업데이트 후 사용자를 찾지 못하면 예외를 던진다', async () => {
    const user: any = { id: '2', status: UserStatusEnum.ACTIVE };
    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    await expect(useCase.execute('2')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
