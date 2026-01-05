import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { UserService } from '../../service/user.service';
import { StatisticsService } from '../../service/statistics.service';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { GenerateTokensUseCase } from './generate-tokens.use-case';
import { LoginAllowedIpService } from '../../service/login-allowed-ip.service';
import { LoginRequest } from '@/presentation/dto/request/login.request';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { LoginLogActionTypeEnum } from '@/presentation/dto/request/create-login-log.request';

const baseLoginRequest: LoginRequest = {
  username: 'admin',
  password: 'Password123!',
};

const activeUser = {
  id: 'user-id',
  username: baseLoginRequest.username,
  passwordHash: 'hash',
  passwordSalt: 'salt',
  kdfParams: {},
  pepperVersion: 'v1',
  role: UserRoleEnum.ADMIN,
  status: UserStatusEnum.ACTIVE,
  approvalStatus: UserApprovalStatusEnum.APPROVED,
  lockedUntil: null,
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userService: jest.Mocked<UserService>;
  let statisticsService: jest.Mocked<StatisticsService>;
  let kcmvpCrypto: jest.Mocked<KcmvpCryptoUtil>;
  let generateTokensUseCase: jest.Mocked<GenerateTokensUseCase>;
  let loginAllowedIpService: jest.Mocked<LoginAllowedIpService>;

  beforeEach(() => {
    userService = {
      findByUsername: jest.fn(),
      handleFailedLogin: jest.fn(),
      handleSuccessfulLogin: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    statisticsService = {
      createLoginLog: jest.fn(),
    } as unknown as jest.Mocked<StatisticsService>;

    kcmvpCrypto = {
      verifyPassword: jest.fn(),
      isHashUpToDate: jest.fn().mockReturnValue(true),
      generateSalt: jest.fn().mockReturnValue('salt'),
      derivePasswordHash: jest.fn(),
    } as unknown as jest.Mocked<KcmvpCryptoUtil>;

    generateTokensUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GenerateTokensUseCase>;

    loginAllowedIpService = {
      isIpAllowed: jest.fn(),
    } as unknown as jest.Mocked<LoginAllowedIpService>;

    useCase = new LoginUseCase(
      userService,
      statisticsService,
      kcmvpCrypto,
      generateTokensUseCase,
      loginAllowedIpService
    );
  });

  it('허용되지 않은 IP는 차단한다', async () => {
    loginAllowedIpService.isIpAllowed.mockResolvedValue(false);

    await expect(
      useCase.execute(baseLoginRequest, '203.0.113.10', 'Chrome')
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(statisticsService.createLoginLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: LoginLogActionTypeEnum.TRY_LOGIN,
      })
    );
  });

  it('비밀번호 검증 성공 시 토큰을 생성한다', async () => {
    loginAllowedIpService.isIpAllowed.mockResolvedValue(true);
    userService.findByUsername.mockResolvedValue({
      ...activeUser,
    } as any);
    kcmvpCrypto.verifyPassword.mockResolvedValue(true);
    userService.handleSuccessfulLogin.mockResolvedValue(undefined);
    userService.findById.mockResolvedValue({
      ...activeUser,
      lastLoginAt: new Date('2024-02-01T00:00:00Z'),
    } as any);
    generateTokensUseCase.execute.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    } as any);

    const result = await useCase.execute(
      baseLoginRequest,
      '203.0.113.10',
      'Chrome'
    );

    expect(kcmvpCrypto.verifyPassword).toHaveBeenCalledWith(
      baseLoginRequest.password,
      activeUser.passwordHash,
      activeUser.passwordSalt,
      activeUser.kdfParams,
      activeUser.pepperVersion
    );
    expect(userService.handleSuccessfulLogin).toHaveBeenCalled();
    expect(generateTokensUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('승인되지 않은 사용자는 차단한다', async () => {
    loginAllowedIpService.isIpAllowed.mockResolvedValue(true);
    userService.findByUsername.mockResolvedValue({
      ...activeUser,
      approvalStatus: UserApprovalStatusEnum.PENDING,
    } as any);

    await expect(
      useCase.execute(baseLoginRequest, undefined, undefined)
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userService.handleSuccessfulLogin).not.toHaveBeenCalled();
  });
});
