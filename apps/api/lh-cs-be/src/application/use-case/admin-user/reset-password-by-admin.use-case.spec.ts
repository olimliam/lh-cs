import { NotFoundException } from '@nestjs/common';
import { ResetPasswordByAdminUseCase } from './reset-password-by-admin.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { PasswordValidator } from '../../../common/utils/password-validator.util';

describe('ResetPasswordByAdminUseCase', () => {
  let useCase: ResetPasswordByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let kcmvpCrypto: jest.Mocked<KcmvpCryptoUtil>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    kcmvpCrypto = {
      generateSalt: jest.fn().mockReturnValue('salt'),
      derivePasswordHash: jest.fn().mockResolvedValue({
        hash: 'new-hash',
        salt: 'new-salt',
        kdfAlgo: 'PBKDF2',
        kdfParams: { iterations: 1200, hashLength: 64 },
        pepperVersion: 2,
        hashCreatedAt: new Date('2024-01-01T00:00:00Z'),
      }),
    } as any;

    useCase = new ResetPasswordByAdminUseCase(userRepository, kcmvpCrypto);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'admin', 12)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('임시 비밀번호를 생성하고 저장한다', async () => {
    userRepository.findById.mockResolvedValue({ id: 'user-1' } as any);
    jest
      .spyOn(PasswordValidator, 'generateValidatedPassword')
      .mockReturnValue('TempPass123!');
    jest
      .spyOn(PasswordValidator, 'getStrengthLevel')
      .mockReturnValue(4);
    jest
      .spyOn(PasswordValidator, 'getStrengthText')
      .mockReturnValue('강함');

    const result = await useCase.execute('user-1', 'admin', 12, '사유');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ passwordHash: 'new-hash' })
    );
    expect(result).toEqual({
      temporaryPassword: 'TempPass123!',
      passwordStrength: 4,
      passwordStrengthText: '강함',
    });
  });
});
