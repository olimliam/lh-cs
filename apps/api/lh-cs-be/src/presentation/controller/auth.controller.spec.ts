import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../application/service/auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { CsrfGuard } from '@/common/guard/csrf.guard';
import { PhoneVerificationService } from '@/application/service/phone-verification.service';
import { AuthSessionService } from '@/application/service/auth-session.service';

const createMockResponse = () => {
  const cookies: Record<string, any> = {};
  return {
    cookie: jest.fn((name: string, value: any) => {
      cookies[name] = value;
    }),
    clearCookie: jest.fn((name: string) => {
      delete cookies[name];
    }),
    locals: {},
    cookies,
  } as any;
};

describe('AuthController (Unit)', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let authSessionService: jest.Mocked<AuthSessionService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
    };

    const mockAuthSession = {
      establishSession: jest.fn().mockResolvedValue(undefined),
      clearSession: jest.fn().mockResolvedValue(undefined),
      buildTokenVerificationPayload: jest.fn(),
    };
    const mockPhoneVerificationService = {} as PhoneVerificationService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthSessionService, useValue: mockAuthSession },
        {
          provide: PhoneVerificationService,
          useValue: mockPhoneVerificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(CsrfGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    authSessionService = module.get(AuthSessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return auth response and set cookies', async () => {
      const mockLoginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        passwordChangeRequired: false,
        user: {
          id: '1',
          username: '123456',
          name: 'Test User',
          role: 'USER',
          status: 'ACTIVE',
          profileImageUrl: null,
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      authService.login.mockResolvedValue(mockLoginResponse as any);
      const mockRequest: any = {
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        headers: {},
        session: {},
        cookies: {},
      };
      const mockResponse = createMockResponse();

      const loginDto = { username: '123456', password: 'password' } as any;

      const result = await controller.login(loginDto, mockRequest, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'test-agent'
      );
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('access-token');
      expect(result.data.passwordChangeRequired).toBe(false);
      expect(result.data.user.username).toBe('123456');
      expect(authSessionService.establishSession).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        {
          userId: '1',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens and set session/cookies', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        passwordChangeRequired: false,
        user: {
          id: '1',
          username: '123456',
          name: 'Test User',
          role: 'USER',
          status: 'ACTIVE',
          profileImageUrl: null,
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      authService.refreshTokens.mockResolvedValue(mockRefreshResponse as any);
      const mockRequest: any = {
        cookies: { refreshToken: 'old-refresh-token' },
        session: {},
      };
      const mockResponse = createMockResponse();

      const result = await controller.refreshTokens(mockRequest, mockResponse);

      expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('new-access-token');
      expect(result.data.passwordChangeRequired).toBe(false);
      expect(result.data.user.username).toBe('123456');
      expect(authSessionService.establishSession).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        {
          userId: '1',
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }
      );
    });
  });
});
