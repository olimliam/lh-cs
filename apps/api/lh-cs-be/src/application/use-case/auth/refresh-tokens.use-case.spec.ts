import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokensUseCase } from './refresh-tokens.use-case';
import { RefreshTokenService } from '../../service/refresh-token.service';
import { UserService } from '../../service/user.service';
import { GenerateTokensUseCase } from './generate-tokens.use-case';
import { UserStatusEnum, UserApprovalStatusEnum } from '@/infrastructure/repository/entity';

describe('RefreshTokensUseCase', () => {
  let useCase: RefreshTokensUseCase;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let userService: jest.Mocked<UserService>;
  let generateTokensUseCase: jest.Mocked<GenerateTokensUseCase>;

  beforeEach(() => {
    refreshTokenService = {
      validateRefreshToken: jest.fn(),
      revokeToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;

    userService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    generateTokensUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GenerateTokensUseCase>;

    useCase = new RefreshTokensUseCase(
      refreshTokenService,
      userService,
      generateTokensUseCase
    );
  });

  it('활성화된 사용자가 아닐 경우 예외를 발생시킨다', async () => {
    refreshTokenService.validateRefreshToken.mockResolvedValue({
      userId: 'inactive-user',
    } as any);
    userService.findById.mockResolvedValue({
      isActive: () => false,
    } as any);

    await expect(useCase.execute('token')).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(refreshTokenService.revokeToken).not.toHaveBeenCalled();
  });

  it('리프레시 토큰을 폐기하고 새 토큰을 반환한다', async () => {
    const user = {
      id: 'user-id',
      status: UserStatusEnum.ACTIVE,
      approvalStatus: UserApprovalStatusEnum.APPROVED,
      isActive: () => true,
    };

    refreshTokenService.validateRefreshToken.mockResolvedValue({
      userId: user.id,
    } as any);
    userService.findById.mockResolvedValue(user as any);
    generateTokensUseCase.execute.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    } as any);

    const result = await useCase.execute('old-token');

    expect(refreshTokenService.revokeToken).toHaveBeenCalledWith('old-token');
    expect(generateTokensUseCase.execute).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });
});
