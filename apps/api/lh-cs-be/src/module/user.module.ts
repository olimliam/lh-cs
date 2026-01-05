import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../infrastructure/repository/user.repository';
import { RefreshTokenRepository } from '../infrastructure/repository/refresh-token.repository';
import { UserSessionRepository } from '../infrastructure/repository/user-session.repository';
import { TermsRepository } from '../infrastructure/repository/terms.repository';
import { UserRegistrationRejectionRepository } from '../infrastructure/repository/user-registration-rejection.repository';
import { UserController } from '../presentation/controller/user.controller';
import { AdminUserController } from '../presentation/controller/admin-user.controller';
import { RefreshTokenEntity } from '@/infrastructure/repository/entity/refresh-token.entity';
import { UserSessionEntity } from '@/infrastructure/repository/entity/user-session.entity';
import { UserService } from '@/application/service/user.service';
import { AdminUserService } from '@/application/service/admin-user.service';
import { UserTermsService } from '@/application/service/user-terms.service';
import {
  UserEntity,
  TermsEntity,
  UserRegistrationRejectionEntity,
} from '@/infrastructure/repository/entity';
import { LoggerModule } from './logger.module';
import { S3ClientService } from '../common/s3/s3-client.service';
import { KcmvpCryptoUtil } from '../common/utils/kcmvp-crypto.util';
import { PhoneEncryptionService } from '@/application/service/phone-encryption.service';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';
import {
  GetProfileWithPhoneUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
  GetUserSessionsUseCase,
  FindUsersUseCase,
  UpdateUserUseCase,
} from '@/application/use-case/user';

import {
  GetLoginHistoryUseCase,
  SoftDeleteUserUseCase,
  UpdateUserApprovalStatusUseCase,
  GetPendingRegistrationsUseCase,
  ApproveRegistrationUseCase,
  CreateUserByAdminUseCase,
  RejectRegistrationUseCase,
  ChangePasswordByAdminUseCase,
  UpdateUserStatusUseCase,
  LockAccountByAdminUseCase,
  ResetPasswordByAdminUseCase,
  GetRejectionHistoryUseCase,
  UnlockAccountByAdminUseCase,
  UpdateUserByAdminUseCase,
  UpdateAdminUserUseCase,
  InactivateUserUseCase,
} from '@/application/use-case/admin-user';
import { ProfileImageSchedulerJobs } from '@/jobs/profile-image-scheduler.jobs';
import { RemoveUnusedProfileImagesUseCase } from '@/application/use-case/user/remove-unused-profile-images.use-case';
import { LockModule } from './lock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      UserSessionEntity,
      TermsEntity,
      UserRegistrationRejectionEntity,
    ]),
    forwardRef(() => LoggerModule),
    forwardRef(() => LockModule),
  ],
  providers: [
    UserRepository,
    RefreshTokenRepository,
    UserSessionRepository,
    TermsRepository,
    UserRegistrationRejectionRepository,
    UserService,
    AdminUserService,
    UserTermsService,
    S3ClientService,
    KcmvpCryptoUtil,
    PhoneEncryptionService,
    IpEncryptionService,
    GetProfileWithPhoneUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    GetUserSessionsUseCase,
    SoftDeleteUserUseCase,
    FindUsersUseCase,
    UpdateUserUseCase,
    GetPendingRegistrationsUseCase,
    GetRejectionHistoryUseCase,
    ApproveRegistrationUseCase,
    RejectRegistrationUseCase,
    CreateUserByAdminUseCase,
    UpdateUserStatusUseCase,
    UpdateUserApprovalStatusUseCase,
    ChangePasswordByAdminUseCase,
    ResetPasswordByAdminUseCase,
    LockAccountByAdminUseCase,
    UnlockAccountByAdminUseCase,
    GetLoginHistoryUseCase,
    UpdateUserByAdminUseCase,
    UpdateAdminUserUseCase,
    InactivateUserUseCase,
    RemoveUnusedProfileImagesUseCase,
    ProfileImageSchedulerJobs,
  ],
  controllers: [UserController, AdminUserController],
  exports: [
    UserService,
    AdminUserService,
    UserRepository,
    RefreshTokenRepository,
    UserSessionRepository,
    TermsRepository,
    UserRegistrationRejectionRepository,
    UserTermsService,
    S3ClientService,
    KcmvpCryptoUtil,
    PhoneEncryptionService,
    IpEncryptionService,
  ],
})
export class UserModule {}
