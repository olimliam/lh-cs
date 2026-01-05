import { HttpStatus } from '@nestjs/common';
import { CustomException } from '@/common/exception/custom.exception';
import { UserErrorCode } from '@/common/exception/error/user-error-code.enum';
import { ChangePasswordUseCase } from './change-password.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { ChangePasswordCommand } from '../../dto/command/change-password.command';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';

jest.mock('../../../common/utils/password-validator.util');

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let kcmvpCrypto: jest.Mocked<KcmvpCryptoUtil>;

  const user: any = {
    id: 'user-1',
    status: 'ACTIVE',
    passwordHash: 'hash',
    passwordSalt: 'salt',
    kdfParams: { algorithm: 'PBKDF2', iterations: 1000, hashLength: 64 },
    pepperVersion: 1,
  };

  const command = new ChangePasswordCommand(
    'user-1',
    'current-password',
    'Newpass123!'
  );

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

    useCase = new ChangePasswordUseCase(userRepository, kcmvpCrypto);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('사용자를 찾을 수 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    try {
      await useCase.execute(command);
      fail('예외가 발생해야 합니다.');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomException);
      expect((error as CustomException).code).toBe(UserErrorCode.USER_NOT_FOUND);
      expect((error as CustomException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    }
  });

  it('새 비밀번호가 정책을 통과하지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(user);
    kcmvpCrypto.verifyPassword.mockResolvedValueOnce(true);
    (PasswordValidator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['weak'],
    });

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      PasswordValidationException
    );
  });

  it('비밀번호 데이터가 불완전하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue({
      ...user,
      passwordSalt: null,
    });

    try {
      await useCase.execute(command);
      fail('예외가 발생해야 합니다.');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomException);
      expect((error as CustomException).code).toBe(
        UserErrorCode.USER_PASSWORD_DATA_INCOMPLETE
      );
      expect((error as CustomException).getStatus()).toBe(
        HttpStatus.BAD_REQUEST
      );
    }
  });

  it('현재 비밀번호가 일치하지 않으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(user);
    kcmvpCrypto.verifyPassword.mockResolvedValueOnce(false);

    try {
      await useCase.execute(command);
      fail('예외가 발생해야 합니다.');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomException);
      expect((error as CustomException).code).toBe(
        UserErrorCode.USER_PASSWORD_INCORRECT
      );
      expect((error as CustomException).getStatus()).toBe(
        HttpStatus.BAD_REQUEST
      );
    }
  });

  it('새 비밀번호가 기존 비밀번호와 동일하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(user);
    kcmvpCrypto.verifyPassword
      .mockResolvedValueOnce(true) // current password check
      .mockResolvedValueOnce(true); // same password check

    try {
      await useCase.execute(command);
      fail('예외가 발생해야 합니다.');
    } catch (error) {
      expect(error).toBeInstanceOf(CustomException);
      expect((error as CustomException).code).toBe(
        UserErrorCode.USER_PASSWORD_SAME_AS_BEFORE
      );
      expect((error as CustomException).getStatus()).toBe(
        HttpStatus.BAD_REQUEST
      );
    }
  });

  it('비밀번호 변경에 성공한다', async () => {
    userRepository.findById.mockResolvedValue({
      ...user,
      status: 'PASSWORD_CHANGE_REQUIRED',
    });
    kcmvpCrypto.verifyPassword
      .mockResolvedValueOnce(true) // current password check
      .mockResolvedValueOnce(false); // same password check
    userRepository.update.mockResolvedValue({} as any);

    await useCase.execute(command);

    expect(kcmvpCrypto.derivePasswordHash).toHaveBeenCalledWith(
      'Newpass123!',
      'salt'
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        passwordHash: 'new-hash',
        status: 'ACTIVE',
      })
    );
  });
});
