import { Injectable, HttpStatus } from '@nestjs/common';
import { UserService } from '../../service/user.service';
import { PhoneVerificationService } from '../../service/phone-verification.service';
import { RegisterRequest } from '@/presentation/dto/request/register.request';
import { RegisterResponse } from '@/presentation/dto/response/register.response';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import {
  AuthErrorCode,
  UserErrorCode,
} from '@/common/exception/error';
import { CustomException } from '@/common/exception/custom.exception';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly phoneVerificationService: PhoneVerificationService
  ) {}

  async execute(registerDto: RegisterRequest): Promise<RegisterResponse> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new CustomException(
        AuthErrorCode.PASSWORD_CONFIRMATION_MISMATCH,
        HttpStatus.BAD_REQUEST
      );
    }

    const existingUser = await this.userService.findByUsername(
      registerDto.username
    );
    if (existingUser) {
      throw new CustomException(
        AuthErrorCode.USER_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST
      );
    }

    const existingPhone = await this.userService.findByPhoneNumber(
      registerDto.phoneNumber
    );
    if (existingPhone) {
      throw new CustomException(
        UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.phoneVerificationService.verifyCode(
      registerDto.phoneNumber,
      registerDto.verificationCode
    );

    if (!registerDto.isConfirmedTerms) {
      throw new CustomException(
        AuthErrorCode.TERMS_NOT_AGREED,
        HttpStatus.BAD_REQUEST
      );
    }

    const createdUser = await this.userService.create({
      name: registerDto.name,
      username: registerDto.username,
      password: registerDto.password,
      phoneNumber: registerDto.phoneNumber,
      phoneVerifiedAt: new Date(),
      role: registerDto.role ?? UserRoleEnum.USER,
      status: UserStatusEnum.WAIT,
      approvalStatus: UserApprovalStatusEnum.PENDING,
      department: registerDto.department,
      isConfirmedTerms: registerDto.isConfirmedTerms,
      signedAt: new Date(),
    });

    return {
      id: createdUser.id,
      username: createdUser.username,
      name: createdUser.name,
      role: createdUser.role,
      status: createdUser.status,
      approvalStatus: createdUser.approvalStatus,
      signedAt: createdUser.signedAt ?? createdUser.createdAt,
      department: createdUser.department ?? null,
    };
  }
}
