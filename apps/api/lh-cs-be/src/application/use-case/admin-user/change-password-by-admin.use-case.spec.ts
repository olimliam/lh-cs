import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';
import { ChangePasswordByAdminUseCase } from './change-password-by-admin.use-case';

jest.mock('../../../common/utils/password-validator.util');

describe('ChangePasswordByAdminUseCase', () => {
  let useCase: ChangePasswordByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let kcmvpCrypto: jest.Mocked<KcmvpCryptoUtil>;

  const user: any = {
    id: 'user-1',
    passwordHash: 'hash',
    passwordSalt: 'salt',
    kdfParams: { iterations: 1000, hashLength: 64 },
    pepperVersion: 1,
  };

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
      verifyPassword: jest.fn(),
    } as any;

    (PasswordValidator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });

    useCase = new ChangePasswordByAdminUseCase(userRepository, kcmvpCrypto);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'Newpass123!', 'admin')
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('비밀번호 검증에 실패하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(user);
    (PasswordValidator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['weak'],
    });

    await expect(
      useCase.execute('user-1', 'Newpass123!', 'admin')
    ).rejects.toBeInstanceOf(PasswordValidationException);
  });

  it('새 비밀번호가 기존 비밀번호와 동일하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(user);
    kcmvpCrypto.verifyPassword.mockResolvedValueOnce(true);

    await expect(
      useCase.execute('user-1', 'Newpass123!', 'admin')
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('관리자가 비밀번호를 변경한다', async () => {
    userRepository.findById.mockResolvedValue(user);
    kcmvpCrypto.verifyPassword.mockResolvedValueOnce(false);

    await useCase.execute('user-1', 'Newpass123!', 'admin', '사유');

    expect(kcmvpCrypto.derivePasswordHash).toHaveBeenCalledWith(
      'Newpass123!',
      'salt'
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        passwordHash: 'new-hash',
        status: 'PASSWORD_CHANGE_REQUIRED',
      })
    );
  });
});
