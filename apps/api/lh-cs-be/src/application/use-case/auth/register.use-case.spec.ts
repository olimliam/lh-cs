import { HttpStatus } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { UserService } from '../../service/user.service';
import { PhoneVerificationService } from '../../service/phone-verification.service';
import { RegisterRequest } from '@/presentation/dto/request/register.request';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
  UserEntity,
} from '@/infrastructure/repository/entity';
import { CustomException } from '@/common/exception/custom.exception';
import { AuthErrorCode, UserErrorCode } from '@/common/exception/error';

const baseRegisterRequest: RegisterRequest = {
  username: 'test-user',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  name: '홍길동',
  phoneNumber: '01012345678',
  verificationCode: '123456',
  isConfirmedTerms: true,
  department: '상담부서',
  role: UserRoleEnum.USER,
};

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userService: jest.Mocked<UserService>;
  let phoneVerificationService: jest.Mocked<PhoneVerificationService>;

  beforeEach(() => {
    userService = {
      findByUsername: jest.fn(),
      findByPhoneNumber: jest.fn(), // Mock the new method
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    phoneVerificationService = {
      verifyCode: jest.fn(),
    } as unknown as jest.Mocked<PhoneVerificationService>;

    useCase = new RegisterUseCase(userService, phoneVerificationService);

    // Default mocks for successful flow
    userService.findByUsername.mockResolvedValue(null);
    userService.findByPhoneNumber.mockResolvedValue(null); // Default mock for phone number
    phoneVerificationService.verifyCode.mockResolvedValue(undefined);
  });

  it('비밀번호 불일치 시 예외를 발생시킨다', async () => {
    await expect(
      useCase.execute({
        ...baseRegisterRequest,
        confirmPassword: 'different',
      })
    ).rejects.toBeInstanceOf(CustomException);
    expect(userService.findByUsername).not.toHaveBeenCalled();
    expect(userService.findByPhoneNumber).not.toHaveBeenCalled();
  });

  it('이미 존재하는 사용자명일 경우 예외를 발생시킨다', async () => {
    userService.findByUsername.mockResolvedValue({
      id: 'existing-user',
    } as UserEntity);

    await expect(useCase.execute(baseRegisterRequest)).rejects.toBeInstanceOf(
      CustomException
    );
    expect(userService.findByPhoneNumber).not.toHaveBeenCalled();
    expect(phoneVerificationService.verifyCode).not.toHaveBeenCalled();
  });

  it('이미 가입된 전화번호일 경우 예외를 발생시킨다', async () => {
    userService.findByUsername.mockResolvedValue(null);
    userService.findByPhoneNumber.mockResolvedValue({
      id: 'existing-phone-user',
    } as UserEntity);

    await expect(useCase.execute(baseRegisterRequest)).rejects.toThrow(
      new CustomException(
        UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN,
        HttpStatus.BAD_REQUEST
      )
    );
    expect(phoneVerificationService.verifyCode).not.toHaveBeenCalled();
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('약관 미동의 시 예외를 발생시킨다', async () => {
    userService.findByUsername.mockResolvedValue(null);
    userService.findByPhoneNumber.mockResolvedValue(null);
    phoneVerificationService.verifyCode.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        ...baseRegisterRequest,
        isConfirmedTerms: false,
      })
    ).rejects.toThrow(
      new CustomException(
        AuthErrorCode.TERMS_NOT_AGREED,
        HttpStatus.BAD_REQUEST
      )
    );
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('신규 사용자를 생성하고 응답을 반환한다', async () => {
    const createdUser = {
      id: 'user-id',
      username: baseRegisterRequest.username,
      name: baseRegisterRequest.name,
      role: UserRoleEnum.USER,
      status: UserStatusEnum.WAIT,
      approvalStatus: UserApprovalStatusEnum.PENDING,
      signedAt: new Date(),
      department: baseRegisterRequest.department,
    };

    userService.findByUsername.mockResolvedValue(null);
    userService.findByPhoneNumber.mockResolvedValue(null);
    phoneVerificationService.verifyCode.mockResolvedValue(undefined);
    userService.create.mockResolvedValue(createdUser as any);

    const result = await useCase.execute(baseRegisterRequest);

    expect(phoneVerificationService.verifyCode).toHaveBeenCalledWith(
      baseRegisterRequest.phoneNumber,
      baseRegisterRequest.verificationCode
    );
    expect(userService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: baseRegisterRequest.username,
        password: baseRegisterRequest.password,
        phoneNumber: baseRegisterRequest.phoneNumber, // Verify phone number is passed
        status: UserStatusEnum.WAIT,
        approvalStatus: UserApprovalStatusEnum.PENDING,
        signedAt: expect.any(Date),
      })
    );
    expect(result).toEqual({
      id: createdUser.id,
      username: createdUser.username,
      name: createdUser.name,
      role: createdUser.role,
      status: createdUser.status,
      approvalStatus: createdUser.approvalStatus,
      signedAt: createdUser.signedAt,
      department: createdUser.department,
    });
  });
});
