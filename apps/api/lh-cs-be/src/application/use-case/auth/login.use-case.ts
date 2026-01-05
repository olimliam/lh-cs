import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequest } from '@/presentation/dto/request/login.request';
import {
  AuthErrorCode,
  AuthErrorData,
} from '@/common/exception/error/auth-error-code.enum';
import {
  LoginFailReasonEnum,
  LoginLogActionTypeEnum,
} from '@/presentation/dto/request/create-login-log.request';
import {
  UserApprovalStatusEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { UserService } from '../../service/user.service';
import { StatisticsService } from '../../service/statistics.service';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { GenerateTokensUseCase } from './generate-tokens.use-case';
import { normalizeIp } from '@/common/utils/ip-utils';
import { LoginAllowedIpService } from '../../service/login-allowed-ip.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly statisticsService: StatisticsService,
    private readonly kcmvpCrypto: KcmvpCryptoUtil,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly loginAllowedIpService: LoginAllowedIpService
  ) {}

  async execute(
    loginDto: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ) {
    const normalizedIp = normalizeIp(ipAddress);
    let counselorId: string | null = null;

    try {
      await this.logLoginAttempt(normalizedIp, userAgent);

      const isIpAllowed =
        await this.loginAllowedIpService.isIpAllowed(normalizedIp);
      if (!isIpAllowed) {
        await this.logLoginFailure(
          LoginFailReasonEnum.NOT_ALLOW_IP,
          null,
          normalizedIp,
          userAgent
        );
        throw new ForbiddenException(AuthErrorData[AuthErrorCode.NOT_ALLOW_IP]);
      }

      const user = await this.userService.findByUsername(loginDto.username);
      if (!user) {
        await this.logLoginFailure(
          LoginFailReasonEnum.FAIL_USERNAME,
          null,
          normalizedIp,
          userAgent
        );
        throw new UnauthorizedException(
          AuthErrorData[AuthErrorCode.INVALID_CREDENTIALS]
        );
      }

      counselorId = user.id;

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await this.logLoginFailure(
          LoginFailReasonEnum.BLOCK_ACCOUNT,
          counselorId,
          normalizedIp,
          userAgent
        );
        throw new UnauthorizedException(
          AuthErrorData[AuthErrorCode.ACCOUNT_LOCKED]
        );
      }

      const isAllowedStatus =
        user.status === UserStatusEnum.ACTIVE ||
        user.status === UserStatusEnum.PASSWORD_CHANGE_REQUIRED;

      if (!isAllowedStatus) {
        await this.logLoginFailure(
          LoginFailReasonEnum.BLOCK_ACCOUNT,
          counselorId,
          normalizedIp,
          userAgent
        );
        throw new UnauthorizedException(
          AuthErrorData[AuthErrorCode.USER_INACTIVE]
        );
      }

      if (user.approvalStatus !== UserApprovalStatusEnum.APPROVED) {
        await this.logLoginFailure(
          LoginFailReasonEnum.BLOCK_ACCOUNT,
          counselorId,
          normalizedIp,
          userAgent
        );
        throw new UnauthorizedException(
          AuthErrorData[AuthErrorCode.USER_NOT_APPROVED]
        );
      }

      if (
        !user.passwordHash ||
        !user.passwordSalt ||
        !user.kdfParams ||
        !user.pepperVersion
      ) {
        await this.logLoginFailure(
          LoginFailReasonEnum.FAIL_PASSWORD,
          counselorId,
          normalizedIp,
          userAgent
        );
        await this.userService.handleFailedLogin(user);
        throw new UnauthorizedException(
          AuthErrorData[AuthErrorCode.INVALID_CREDENTIALS]
        );
      }

      const isPasswordValid = await this.kcmvpCrypto.verifyPassword(
        loginDto.password,
        user.passwordHash,
        user.passwordSalt,
        user.kdfParams,
        user.pepperVersion
      );

      if (!isPasswordValid) {
        await this.logLoginFailure(
          LoginFailReasonEnum.FAIL_PASSWORD,
          counselorId,
          normalizedIp,
          userAgent
        );
        const { currentAttempts, maxAttempts, lockedUntil } =
          await this.userService.handleFailedLogin(user);

        const base = AuthErrorData[AuthErrorCode.LOGIN_PASSWORD_MISMATCH];
        const lockMessage = lockedUntil
          ? ` 계정이 ${lockedUntil.toISOString()}까지 잠겨 있습니다.`
          : '';
        const message = `${base.message} 실패 횟수 ${currentAttempts}/${maxAttempts}회입니다.${lockMessage}`;

        throw new UnauthorizedException({
          code: base.code,
          message,
        });
      }

      await this.userService.handleSuccessfulLogin(user, normalizedIp, userAgent);

      const refreshedUser = await this.userService.findById(user.id);
      const loginUser = refreshedUser ?? user;

      if (
        isPasswordValid &&
        !this.kcmvpCrypto.isHashUpToDate(
          loginUser.kdfParams,
          loginUser.pepperVersion
        )
      ) {
        await this.upgradeUserPassword(loginUser.id, loginDto.password);
      }

      await this.logLoginSuccess(counselorId, normalizedIp, userAgent);

      return this.generateTokensUseCase.execute(loginUser);
    } catch (error) {
      if ((error as any).status >= 500 || !(error as any).status) {
        await this.logLoginFailure(
          LoginFailReasonEnum.SERVER_ERROR,
          counselorId,
          normalizedIp,
          userAgent
        );
      }
      throw error;
    }
  }

  private async upgradeUserPassword(
    userId: string,
    password: string
  ): Promise<void> {
    try {
      const salt = this.kcmvpCrypto.generateSalt();
      const hashResult = await this.kcmvpCrypto.derivePasswordHash(
        password,
        salt
      );

      await this.userService.update(userId, {
        passwordHash: hashResult.hash,
        passwordSalt: hashResult.salt,
        kdfAlgorithm: hashResult.kdfAlgo,
        kdfParams: hashResult.kdfParams,
        pepperVersion: hashResult.pepperVersion,
        hashCreatedAt: hashResult.hashCreatedAt,
      });

      // eslint-disable-next-line no-console
      console.log(
        `User ${userId} password upgraded to latest KCMVP parameters`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to upgrade user ${userId} password:`, error);
    }
  }

  private async logLoginAttempt(
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const normalizedIp = normalizeIp(ipAddress);
    try {
      await this.statisticsService.createLoginLog({
        actionType: LoginLogActionTypeEnum.TRY_LOGIN,
        counselorId: null,
        device: userAgent,
        ipAddress: normalizedIp,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to log login attempt:', error);
    }
  }

  private async logLoginSuccess(
    counselorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const normalizedIp = normalizeIp(ipAddress);
    try {
      await this.statisticsService.createLoginLog({
        actionType: LoginLogActionTypeEnum.SUCCESS_LOGIN,
        counselorId,
        device: userAgent,
        ipAddress: normalizedIp,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to log login success:', error);
    }
  }

  private async logLoginFailure(
    reason: string,
    counselorId: string | null,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const normalizedIp = normalizeIp(ipAddress);
    try {
      await this.statisticsService.createLoginLog({
        actionType: LoginLogActionTypeEnum.FAIL_LOGIN,
        actionValue: reason,
        counselorId,
        device: userAgent,
        ipAddress: normalizedIp,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to log login failure:', error);
    }
  }
}
