import { LogoutUseCase } from './logout.use-case';
import { RefreshTokenService } from '../../service/refresh-token.service';

describe('LogoutUseCase', () => {
  it('리프레시 토큰을 폐기한다', async () => {
    const refreshTokenService = {
      revokeToken: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RefreshTokenService>;
    const useCase = new LogoutUseCase(refreshTokenService);

    await useCase.execute('refresh-token');

    expect(refreshTokenService.revokeToken).toHaveBeenCalledWith(
      'refresh-token'
    );
  });
});
