import { Module, Global, forwardRef, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../application/service/auth.service';
import { VisionAiSessionService } from '@/application/service/vision-ai-session.service';
import { VisionAiProfileService } from '@/application/service/vision-ai-profile.service';
import { RefreshTokenService } from '../application/service/refresh-token.service';
import { CsrfService } from '../application/service/csrf.service';
import { AuthSessionService } from '@/application/service/auth-session.service';
import { AuthController } from '../presentation/controller/auth.controller';
import { VisitorController } from '../presentation/controller/visitor.controller';
import { AdminAuthController } from '@/presentation/controller/admin-auth.controller';
import { LoginAllowedIpController } from '@/presentation/controller/login-allowed-ip.controller';
import { ExternalVisionAiController } from '@/presentation/controller/external-vision-ai.controller';
import { CsrfGuard } from '../common/guard/csrf.guard';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { JwtStrategy } from '@/common/strategy/jwt.strategy';
import { UserModule } from './user.module';
import { ConsultationModule } from './consultation.module';
import { LoggerModule } from './logger.module';
import { StatisticsModule } from './statistics.module';
import { RefreshTokenRepository } from '../infrastructure/repository/refresh-token.repository';
import { RefreshTokenEntity } from '../infrastructure/repository/entity/refresh-token.entity';
import { UserEntity } from '../infrastructure/repository/entity/user.entity';
import { PhoneVerificationEntity } from '@/infrastructure/repository/entity/phone-verification.entity';
import { SmsQueueEntity } from '@/infrastructure/repository/entity/sms-queue.entity';
import { PhoneVerificationService } from '@/application/service/phone-verification.service';
import { SmsQueueService } from '@/application/service/sms-queue.service';
import { PhoneVerificationRepository } from '@/infrastructure/repository/phone-verification.repository';
import { SmsQueueRepository } from '@/infrastructure/repository/sms-queue.repository';
import { LoginAllowedIpEntity } from '@/infrastructure/repository/entity/login-allowed-ip.entity';
import { LoginAllowedIpHistoryEntity } from '@/infrastructure/repository/entity/login-allowed-ip-history.entity';
import { LoginAllowedIpRepository } from '@/infrastructure/repository/login-allowed-ip.repository';
import { LoginAllowedIpHistoryRepository } from '@/infrastructure/repository/login-allowed-ip-history.repository';
import { LoginAllowedIpService } from '@/application/service/login-allowed-ip.service';
import { PhoneVerificationSchedulerService } from '@/application/service/phone-verification-scheduler.service';
import { RegisterUseCase } from '@/application/use-case/auth/register.use-case';
import { LoginUseCase } from '@/application/use-case/auth/login.use-case';
import { RefreshTokensUseCase } from '@/application/use-case/auth/refresh-tokens.use-case';
import { LogoutUseCase } from '@/application/use-case/auth/logout.use-case';
import { LogoutAllUseCase } from '@/application/use-case/auth/logout-all.use-case';
import { AuthenticateVisitorUseCase } from '@/application/use-case/auth/authenticate-visitor.use-case';
import { CheckVisitorIdUseCase } from '@/application/use-case/auth/check-visitor-id.use-case';
import { GenerateTokensUseCase } from '@/application/use-case/auth/generate-tokens.use-case';
import { VisionAiAuthTokenEntity } from '@/infrastructure/repository/entity/vision-ai-auth-token.entity';
import { VisionAiAuthTokenRepository } from '@/infrastructure/repository/vision-ai-auth-token.repository';
import { VisionAiEptGuard } from '@/common/guard/vision-ai-ept.guard';
import { VisionAiOriginGuard } from '@/common/guard/vision-ai-origin.guard';
import { VisionAiAudienceGuard } from '@/common/guard/vision-ai-audience.guard';
import { VisionAiScopeGuard } from '@/common/guard/vision-ai-scope.guard';
import { VisionAiOneTimeGuard } from '@/common/guard/vision-ai-one-time.guard';
import { VisionAiSessionGuard } from '@/common/guard/vision-ai-session.guard';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';
import { IpMigrationService } from '@/application/service/ip-migration.service';
import { IpMigrationController } from '@/presentation/controller/ip-migration.controller';
import { AdminLogEntity } from '@/infrastructure/repository/entity/admin-log.entity';
import { LoginLogEntity } from '@/infrastructure/repository/entity/login-log.entity';
import { FreeTourLogEntity } from '@/infrastructure/repository/entity/free-tour-log.entity';
import { ConsultationLogEntity } from '@/infrastructure/repository/entity/consultation-log.entity';
import { UserSessionEntity } from '@/infrastructure/repository/entity/user-session.entity';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      RefreshTokenEntity,
      UserEntity,
      PhoneVerificationEntity,
      SmsQueueEntity,
      LoginAllowedIpEntity,
      LoginAllowedIpHistoryEntity,
      AdminLogEntity,
      LoginLogEntity,
      FreeTourLogEntity,
      ConsultationLogEntity,
      UserSessionEntity,
      VisionAiAuthTokenEntity,
    ]),
    UserModule,
    ConsultationModule,
    StatisticsModule,
    forwardRef(() => LoggerModule),
  ],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    AuthenticateVisitorUseCase,
    CheckVisitorIdUseCase,
    GenerateTokensUseCase,
    RefreshTokenService,
    CsrfService,
    RefreshTokenRepository,
    JwtStrategy,
    CsrfGuard,
    JwtAuthGuard,
    PhoneVerificationService,
    PhoneVerificationRepository,
    SmsQueueService,
    SmsQueueRepository,
    LoginAllowedIpService,
    LoginAllowedIpRepository,
    LoginAllowedIpHistoryRepository,
    IpEncryptionService,
    IpMigrationService,
    PhoneVerificationSchedulerService,
    Logger,
    VisionAiSessionService,
    VisionAiProfileService,
    VisionAiAuthTokenRepository,
    VisionAiEptGuard,
    VisionAiOriginGuard,
    VisionAiAudienceGuard,
    VisionAiScopeGuard,
    VisionAiOneTimeGuard,
    VisionAiSessionGuard,
    AuthSessionService,
  ],
  controllers: [
    AuthController,
    VisitorController,
    AdminAuthController,
    LoginAllowedIpController,
    ExternalVisionAiController,
    IpMigrationController,
  ],
  exports: [
    AuthService,
    RefreshTokenService,
    CsrfService,
    RefreshTokenRepository,
    CsrfGuard,
    JwtAuthGuard,
    JwtModule,
    PhoneVerificationService,
    AuthSessionService,
  ],
})
export class AuthModule {}
