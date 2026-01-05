import { GetLoginHistoryUseCase } from './get-login-history.use-case';
import { UserSessionRepository } from '../../../infrastructure/repository/user-session.repository';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';

describe('GetLoginHistoryUseCase', () => {
  let useCase: GetLoginHistoryUseCase;
  let userSessionRepository: jest.Mocked<UserSessionRepository>;
  let ipEncryptionService: jest.Mocked<IpEncryptionService>;

  beforeEach(() => {
    userSessionRepository = {
      findAllSessionsByUserId: jest.fn(),
    } as any;

    ipEncryptionService = {
      decrypt: jest.fn().mockReturnValue('127.0.0.1'),
    } as any;

    useCase = new GetLoginHistoryUseCase(
      userSessionRepository,
      ipEncryptionService
    );
  });

  it('로그인 히스토리를 반환한다', async () => {
    userSessionRepository.findAllSessionsByUserId.mockResolvedValue([
      {
        id: 'session-1',
        ipAddress: '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NCo0p1bQtf5Z8=',
        userAgent: 'Chrome',
        loginAt: new Date('2024-01-01T00:00:00Z'),
        logoutAt: new Date('2024-01-01T01:00:00Z'),
        isActive: () => false,
      },
    ] as any);

    const result = await useCase.execute('user-1');

    expect(result[0]).toEqual({
      id: 'session-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Chrome',
      loginAt: new Date('2024-01-01T00:00:00Z'),
      logoutAt: new Date('2024-01-01T01:00:00Z'),
      isActive: false,
      duration: 60,
    });
  });
});
