import { LogoutAllUseCase } from './logout-all.use-case';
import { RefreshTokenService } from '../../service/refresh-token.service';

describe('LogoutAllUseCase', () => {
  it('사용자의 모든 리프레시 토큰을 폐기한다', async () => {
    const refreshTokenService = {
      revokeAllUserTokens: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RefreshTokenService>;
    const useCase = new LogoutAllUseCase(refreshTokenService);

    await useCase.execute('user-id');

    expect(refreshTokenService.revokeAllUserTokens).toHaveBeenCalledWith(
      'user-id'
    );
  });
});
