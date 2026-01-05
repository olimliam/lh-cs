import { BadRequestException } from '@nestjs/common';
import { CreateUserByAdminUseCase } from './create-user-by-admin.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';
import { UserStatusEnum, UserApprovalStatusEnum } from '@/infrastructure/repository/entity';

jest.mock('../../../common/utils/password-validator.util');

describe('CreateUserByAdminUseCase', () => {
  let useCase: CreateUserByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let kcmvpCrypto: jest.Mocked<KcmvpCryptoUtil>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  const createDto: any = {
    username: 'admin1',
    password: 'Password123!',
    phoneNumber: '01012345678',
  };

  beforeEach(() => {
    userRepository = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    } as any;

    kcmvpCrypto = {
      generateSalt: jest.fn().mockReturnValue('salt'),
      derivePasswordHash: jest.fn().mockResolvedValue({
        hash: 'hash',
        salt: 'salt',
        kdfAlgo: 'PBKDF2',
        kdfParams: { iterations: 1200, hashLength: 64 },
        pepperVersion: 2,
        hashCreatedAt: new Date('2024-01-01T00:00:00Z'),
      }),
    } as any;

    phoneEncryptionService = {
      encrypt: jest.fn().mockReturnValue({
        hash: 'phone-hash',
        encrypted: Buffer.from('enc'),
        iv: Buffer.from('iv'),
        authTag: Buffer.from('tag'),
      }),
    } as any;

    (PasswordValidator.validate as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });

    useCase = new CreateUserByAdminUseCase(
      userRepository,
      kcmvpCrypto,
      phoneEncryptionService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('이미 존재하는 아이디면 예외를 던진다', async () => {
    userRepository.findByUsername.mockResolvedValue({ id: 'user-1' } as any);

    await expect(useCase.execute(createDto)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('비밀번호 검증에 실패하면 예외를 던진다', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    (PasswordValidator.validate as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['weak'],
    });

    await expect(useCase.execute(createDto)).rejects.toBeInstanceOf(
      PasswordValidationException
    );
  });

  it('관리자가 사용자를 생성한다', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 'user-1' } as any);

    await useCase.execute({
      ...createDto,
      status: UserStatusEnum.ACTIVE,
      approvalStatus: UserApprovalStatusEnum.APPROVED,
    });

    expect(phoneEncryptionService.encrypt).toHaveBeenCalled();
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: 'hash',
        phoneHash: 'phone-hash',
        password: undefined,
        approvalCompletedAt: expect.any(Date),
        approvalCompletedByUserId: null,
      })
    );
  });
});
