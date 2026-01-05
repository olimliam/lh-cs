import { GenerateTokensUseCase } from './generate-tokens.use-case';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../../service/refresh-token.service';
import { UserStatusEnum, UserApprovalStatusEnum } from '@/infrastructure/repository/entity';

const baseUser = {
  id: 'user-id',
  username: 'tester',
  name: '테스터',
  role: 'USER',
  status: UserStatusEnum.ACTIVE,
  approvalStatus: UserApprovalStatusEnum.APPROVED,
  profileImageUrl: null,
  lastLoginAt: new Date('2024-01-01T00:00:00Z'),
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
};

describe('GenerateTokensUseCase', () => {
  let useCase: GenerateTokensUseCase;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  beforeEach(() => {
    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'secret';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    refreshTokenService = {
      createRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
    } as unknown as jest.Mocked<RefreshTokenService>;

    useCase = new GenerateTokensUseCase(
      jwtService,
      configService,
      refreshTokenService
    );
  });

  it('JWT 토큰과 리프레시 토큰을 생성한다', async () => {
    const result = await useCase.execute(baseUser as any);

    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: baseUser.id,
        username: baseUser.username,
        role: baseUser.role,
      },
      {
        secret: 'secret',
        expiresIn: '15m',
      }
    );
    expect(refreshTokenService.createRefreshToken).toHaveBeenCalledWith(
      baseUser.id
    );
    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      passwordChangeRequired: false,
      user: expect.objectContaining({
        id: baseUser.id,
        username: baseUser.username,
      }),
    });
  });

  it('비밀번호 변경 필요 상태를 감지한다', async () => {
    const result = await useCase.execute({
      ...baseUser,
      status: UserStatusEnum.PASSWORD_CHANGE_REQUIRED,
    } as any);

    expect(result.passwordChangeRequired).toBe(true);
  });
});
