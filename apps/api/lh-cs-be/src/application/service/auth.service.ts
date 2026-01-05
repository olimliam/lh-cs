import { Injectable } from '@nestjs/common';
import {
  RegisterUseCase,
  LoginUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  AuthenticateVisitorUseCase,
  CheckVisitorIdUseCase,
  GenerateTokensUseCase,
} from '../use-case/auth';

import { RegisterRequest } from '@/presentation/dto/request/register.request';
import { RegisterResponse } from '@/presentation/dto/response/register.response';
import { LoginRequest } from '@/presentation/dto/request/login.request';
import { VisitorAuthRequest } from '@/presentation/dto/request/visitor-auth.request';
import { VisitorAuthResponse } from '@/presentation/dto/response/visitor-auth.response';
import { VisitorIdCheckRequest } from '@/presentation/dto/request/visitor-id-check.request';
import { VisitorIdCheckResponse } from '@/presentation/dto/response/visitor-id-check.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly authenticateVisitorUseCase: AuthenticateVisitorUseCase,
    private readonly checkVisitorIdUseCase: CheckVisitorIdUseCase,
    private readonly generateTokensUseCase: GenerateTokensUseCase
  ) {}

  register(registerDto: RegisterRequest): Promise<RegisterResponse> {
    return this.registerUseCase.execute(registerDto);
  }

  login(loginDto: LoginRequest, ipAddress?: string, userAgent?: string) {
    return this.loginUseCase.execute(loginDto, ipAddress, userAgent);
  }

  refreshTokens(refreshToken: string) {
    return this.refreshTokensUseCase.execute(refreshToken);
  }

  logout(refreshToken: string): Promise<void> {
    return this.logoutUseCase.execute(refreshToken);
  }

  logoutAll(userId: string): Promise<void> {
    return this.logoutAllUseCase.execute(userId);
  }

  authenticateVisitor(
    visitorAuthDto: VisitorAuthRequest
  ): Promise<VisitorAuthResponse> {
    return this.authenticateVisitorUseCase.execute(visitorAuthDto);
  }

  checkVisitorId(
    visitorId: string,
    checkDto: VisitorIdCheckRequest
  ): Promise<VisitorIdCheckResponse> {
    return this.checkVisitorIdUseCase.execute(visitorId, checkDto);
  }

  generateTokens(user: any) {
    return this.generateTokensUseCase.execute(user);
  }
}
