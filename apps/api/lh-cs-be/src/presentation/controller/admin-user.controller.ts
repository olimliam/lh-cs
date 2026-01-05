import {
  UserRoleEnum,
  UserStatusEnum,
  UserApprovalStatusEnum,
  UserLockStatusEnum,
} from '@/infrastructure/repository/entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AdminUserService } from '../../application/service/admin-user.service';
import { UpdateAdminUserUseCase } from '@/application/use-case/admin-user';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { Roles } from '../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import {
  ChangeUserPasswordRequest,
  CreateUserRequest,
  GetUsersRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserApprovalRequest,
  UpdateUserLockRequest,
  RejectRegistrationRequest,
  GetApprovalsRequest,
} from '../dto/request';
import {
  UpdateUserFormRequest,
  toUpdateUserPayload,
} from '../dto/request/update-user.request';
import type { Express } from 'express';

import {
  CreateUserResponse,
  GetUserDepartmentsResponse,
  GetUserDetailResponse,
  GetUsersResponse,
  ResetPasswordResponse,
  UpdateUserResponse,
} from '../dto/response';
import {
  ChangePasswordResponse,
  DeleteUserResponse,
  UpdateUserStatusResponse,
  UpdateUserApprovalResponse,
  UpdateUserLockResponse,
  InactivateUserResponse,
} from '../dto/response/user-actions.response';
import {
  PendingRegistrationItemResponse,
  PendingRegistrationsResponse,
  RejectionHistoryItemResponse,
  RejectionHistoryResponse,
} from '../dto/response/user-approval.response';
import {
  AdminApprovalState,
  PendingRegistrationsResult,
  RejectionHistoryResult,
} from '../../application/dto/user/user.dto';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
@ApiBearerAuth('bearer')
@ApiExtraModels(
  GetUsersResponse,
  GetUserDetailResponse,
  CreateUserResponse,
  UpdateUserResponse,
  UpdateUserStatusResponse,
  UpdateUserApprovalResponse,
  UpdateUserLockResponse,
  ChangePasswordResponse,
  ResetPasswordResponse,
  DeleteUserResponse,
  InactivateUserResponse,
  GetUserDepartmentsResponse
)
export class AdminUserController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly updateAdminUserUseCase: UpdateAdminUserUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회 (관리자)' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지 크기',
    example: 10,
  })
  @ApiQuery({
    name: 'statuses',
    required: false,
    enum: UserStatusEnum,
    isArray: true,
    description: '사용자 상태 필터 (쉼표 구분 또는 다중 파라미터)',
  })
  @ApiQuery({
    name: 'roles',
    required: false,
    enum: [UserRoleEnum.ADMIN, UserRoleEnum.CONSULTANT],
    isArray: true,
    description: '사용자 권한 필터 (다중 선택, 미선택 시 기본 권한 조회)',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    description: '전화번호 (정확 일치)',
    example: '01012345678',
  })
  @ApiQuery({
    name: 'approvalStatuses',
    required: false,
    enum: Object.values(UserApprovalStatusEnum),
    isArray: true,
    description: '가입 승인 상태 필터 (쉼표 대신 다중 파라미터)',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    description: '아이디 검색 (부분 일치)',
    example: 'hong',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '이름 검색 (부분 일치)',
    example: '홍길동',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '부서 검색 (부분 일치)',
    example: '영업',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    enum: ['createdAt', 'lastLoginAt', 'name'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '정렬 순서',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    schema: { $ref: getSchemaPath(GetUsersResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async getUsers(@Query() query: GetUsersRequest): Promise<GetUsersResponse> {
    const result = await this.adminUserService.getUsersForAdmin({
      page: query.page,
      limit: query.limit,
      statuses: query.statuses,
      roles: query.roles,
      phoneNumber: query.phoneNumber,
      approvalStatuses: query.approvalStatuses,
      username: query.username,
      name: query.name,
      department: query.department,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      success: true,
      data: {
        users: result.users.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          department: user.department,
          role: user.role,
          status: user.status as UserStatusEnum,
          inactiveAt: user.inactiveAt ?? null,
          signedAt: (user as any).signedAt ?? user.createdAt ?? null,
          createdAt: user.createdAt,
          lockStatus:
            (user.lockState as UserLockStatusEnum) ??
            UserLockStatusEnum.UNLOCKED,
          lockAt: user.lockAt ?? null,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        summary: {
          activeCount: result.summary?.activeCount ?? 0,
          inactiveCount: result.summary?.inactiveCount ?? 0,
          lockedCount: result.summary?.lockedCount ?? 0,
        },
      },
    };
  }

  @Get('approvals')
  @ApiOperation({ summary: '가입 승인/거절 상태별 목록 조회' })
  @ApiQuery({
    name: 'state',
    required: true,
    enum: AdminApprovalState,
    description: '조회할 가입 상태',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: '페이지 크기',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    description: '아이디 검색 (부분 일치)',
    example: 'hong',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '이름 검색 (부분 일치)',
    example: '홍길동',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '부서 검색 (부분 일치)',
    example: '영업',
  })
  @ApiResponse({
    status: 200,
    description: '가입 상태별 목록 조회 성공',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(PendingRegistrationsResponse) },
        { $ref: getSchemaPath(RejectionHistoryResponse) },
      ],
    },
  })
  async getApprovals(
    @Query() query: GetApprovalsRequest
  ): Promise<PendingRegistrationsResponse | RejectionHistoryResponse> {
    const {
      state,
      page = 1,
      limit = 20,
      username,
      name,
      department,
    } = query;
    const result = await this.adminUserService.getApprovals(
      state,
      page,
      limit,
      {
        username,
        name,
        department,
      }
    );

    if (state === AdminApprovalState.REJECTED) {
      const rejectionResult = result as RejectionHistoryResult;
      return {
        success: true,
        data: {
          items: rejectionResult.items.map(
            (item): RejectionHistoryItemResponse => ({
              userId: item.userId,
              username: item.username,
              department: item.department ?? null,
              signedAt: item.signedAt,
              rejectedAt: item.rejectedAt,
              rejectedBy: item.rejectedBy ?? null,
              reason: item.reason ?? null,
            })
          ),
          pagination: {
            page: rejectionResult.pagination.page,
            limit: rejectionResult.pagination.limit,
            total: rejectionResult.pagination.total,
            totalPages: rejectionResult.pagination.totalPages,
          },
        },
      };
    }

    const approvalResult = result as PendingRegistrationsResult;
    return {
      success: true,
      data: {
        items: approvalResult.items.map(
          (item): PendingRegistrationItemResponse => ({
            userId: item.userId,
            username: item.username,
            name: item.name,
            department: item.department ?? null,
            phoneNumber: item.phoneNumber ?? null,
            signedAt: item.signedAt,
            approvedAt: item.approvedAt ?? null,
            approvedBy: item.approvedBy ?? null,
          })
        ),
        pagination: {
          page: approvalResult.pagination.page,
          limit: approvalResult.pagination.limit,
          total: approvalResult.pagination.total,
          totalPages: approvalResult.pagination.totalPages,
        },
      },
    };
  }

  @Post('approvals/:id/approve')
  @ApiOperation({ summary: '가입 승인 처리' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: '가입 승인 성공',
    schema: { $ref: getSchemaPath(UpdateUserApprovalResponse) },
  })
  async approveRegistration(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ): Promise<UpdateUserApprovalResponse> {
    if (!currentUser?.id) {
      throw new BadRequestException('승인 처리자 정보를 확인할 수 없습니다.');
    }

    if (this.isNotApprovalManager(currentUser?.role)) {
      throw new ForbiddenException('가입 승인 권한이 없습니다.');
    }

    const user = await this.adminUserService.approveRegistration(
      String(id),
      currentUser.id
    );

    return {
      success: true,
      message: 'User approval status updated successfully',
      data: {
        id: user.id,
        approvalStatus: user.approvalStatus,
        status: user.status as UserStatusEnum,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Post('approvals/:id/reject')
  @ApiOperation({ summary: '가입 거절 처리' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '123' })
  @ApiResponse({
    status: 200,
    description: '가입 거절 성공',
    schema: { $ref: getSchemaPath(UpdateUserApprovalResponse) },
  })
  async rejectRegistration(
    @Param('id') id: string,
    @Body() body: RejectRegistrationRequest,
    @CurrentUser() currentUser: any
  ): Promise<UpdateUserApprovalResponse> {
    if (!currentUser?.id) {
      throw new BadRequestException('거절 처리자 정보를 확인할 수 없습니다.');
    }

    if (this.isNotApprovalManager(currentUser?.role)) {
      throw new ForbiddenException('가입 거절 권한이 없습니다.');
    }

    const user = await this.adminUserService.rejectRegistration(
      String(id),
      currentUser?.id,
      body.reason
    );

    return {
      success: true,
      message: 'User approval status updated successfully',
      data: {
        id: user.id,
        approvalStatus: user.approvalStatus,
        status: user.status as UserStatusEnum,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: '신규 사용자 생성 (관리자)' })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    schema: { $ref: getSchemaPath(CreateUserResponse) },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (아이디 중복, 비밀번호 정책 위반 등)',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Password Validation Failed' },
        message: {
          type: 'string',
          example: '비밀번호가 보안 정책을 만족하지 않습니다.',
        },
        details: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '비밀번호는 최소 8자 이상이어야 합니다.',
            '비밀번호에 대문자가 포함되어야 합니다.',
            '비밀번호에 특수문자(!@#$%^&*(),.?":{}|<>)가 포함되어야 합니다.',
          ],
        },
        timestamp: { type: 'string', format: 'date-time' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async createUser(
    @Body() createUserDto: CreateUserRequest
  ): Promise<CreateUserResponse> {
    const newUser = await this.adminUserService.createByAdmin({
      ...createUserDto,
      password: createUserDto.password, // 평문 비밀번호 (서비스에서 검증 후 해싱됨)
    });

    return {
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        department: newUser.department,
        role: newUser.role,
        status: newUser.status as UserStatusEnum,
        approvalStatus: newUser.approvalStatus,
        profileImageUrl: newUser.profileImageUrl,
        createdAt: newUser.createdAt,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    schema: { $ref: getSchemaPath(GetUserDetailResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async getUser(@Param('id') id: string): Promise<GetUserDetailResponse> {
    const user = await this.adminUserService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // const loginHistory = await this.adminUserService.getLoginHistory(id);
    const phoneNumber = this.adminUserService.getUserPhoneNumber(user);

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        department: user.department,
        phoneNumber,
        role: user.role,
        status: user.status as UserStatusEnum,
        inactiveAt: user.inactiveAt ?? null,
        approvalStatus: user.approvalStatus,
        signedAt: (user as any).signedAt ?? user.createdAt ?? null,
        approvedAt: user.approvalCompletedAt ?? null,
        lockStatus:
          (user.lockState as UserLockStatusEnum) ?? UserLockStatusEnum.UNLOCKED,
        profileImageUrl: user.profileImageUrl,
        lastLoginAt: user.lastLoginAt,
        loginAttemptCount: user.loginAttemptCount,
        lockAt: user.lockAt ?? null,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt, // 사용중지 날짜
        // loginHistory, // 로그인 히스토리 (user_sessions 기반) - 주석 처리
      },
    };
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiOperation({ summary: '사용자 정보 수정 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '사용자 정보 수정 요청',
    type: UpdateUserFormRequest,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    schema: { $ref: getSchemaPath(UpdateUserResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async updateUser(
    @Param('id') id: string,
    @Body() request: UpdateUserRequest,
    @UploadedFile() profileImage?: Express.Multer.File
  ): Promise<UpdateUserResponse> {
    const payload = toUpdateUserPayload(request);
    const { user, phoneNumber, updatedAt } =
      await this.updateAdminUserUseCase.execute({
        userId: String(id),
        payload,
        profileImage,
        isEditProfileImage: request.isEditProfileImage,
      });

    return {
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        department: user.department,
        phoneNumber,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        status: user.status as UserStatusEnum,
        approvalStatus: user.approvalStatus,
        updatedAt,
      },
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '사용자 상태 변경 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 상태 변경 성공',
    schema: { $ref: getSchemaPath(UpdateUserStatusResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async updateUserStatusEnum(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusRequest
  ): Promise<UpdateUserStatusResponse> {
    const updatedUser = await this.adminUserService.updateStatus(
      id,
      body.status
    );

    return {
      success: true,
      message: 'User status updated successfully',
      data: {
        id: updatedUser.id,
        status: updatedUser.status,
        inactiveAt: updatedUser.inactiveAt ?? null,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  @Post(':id/inactivate')
  @ApiOperation({ summary: '회원 중단(INACTIVE 처리, 관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '회원 중단 성공',
    schema: { $ref: getSchemaPath(InactivateUserResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async inactivateUser(
    @Param('id') id: string
  ): Promise<InactivateUserResponse> {
    const userId = String(id);
    const inactiveUser = await this.adminUserService.inactivateUser(userId);

    return {
      success: true,
      message: 'User inactivated successfully',
      data: {
        id: inactiveUser.id,
        status: inactiveUser.status as UserStatusEnum,
        username: inactiveUser.username,
        name: inactiveUser.name,
        inactiveAt: inactiveUser.inactiveAt ?? null,
        updatedAt: inactiveUser.updatedAt,
      },
    };
  }

  @Put(':id/approval')
  @ApiOperation({ summary: '사용자 승인 상태 변경 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 승인 상태 변경 성공',
    schema: { $ref: getSchemaPath(UpdateUserApprovalResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async updateUserApproval(
    @Param('id') id: string,
    @Body() body: UpdateUserApprovalRequest,
    @CurrentUser() currentUser: any
  ): Promise<UpdateUserApprovalResponse> {
    const needsActorId = body.approvalStatus !== UserApprovalStatusEnum.PENDING;

    if (needsActorId && !currentUser?.id) {
      throw new BadRequestException('처리자 정보를 확인할 수 없습니다.');
    }

    if (this.isNotApprovalManager(currentUser?.role)) {
      throw new ForbiddenException('가입 승인/거절 권한이 없습니다.');
    }

    const userId = String(id);
    const updatedUser = await this.adminUserService.updateApprovalStatus(
      userId,
      body.approvalStatus,
      currentUser?.id,
      body.reason
    );

    return {
      success: true,
      message: 'User approval status updated successfully',
      data: {
        id: updatedUser.id,
        approvalStatus: updatedUser.approvalStatus,
        status: updatedUser.status as UserStatusEnum,
        inactiveAt: updatedUser.inactiveAt ?? null,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  private isNotApprovalManager(role?: UserRoleEnum): boolean {
    return (
      !role ||
      (role !== UserRoleEnum.ADMIN && role !== UserRoleEnum.SUPER_ADMIN)
    );
  }

  @Put(':id/lock')
  @ApiOperation({ summary: '사용자 계정 잠금 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 계정 잠금 성공',
    schema: { $ref: getSchemaPath(UpdateUserLockResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async lockUser(
    @Param('id') id: string,
    @Body() body: UpdateUserLockRequest
  ): Promise<UpdateUserLockResponse> {
    const userId = String(id);
    const lockedUser = await this.adminUserService.lockAccountByAdmin(
      userId,
      body.durationMinutes
    );

    return {
      success: true,
      message: 'User locked successfully',
      data: {
        id: lockedUser.id,
        lockedUntil: lockedUser.lockedUntil,
        loginAttemptCount: lockedUser.loginAttemptCount,
        updatedAt: lockedUser.updatedAt,
      },
    };
  }

  @Delete(':id/lock')
  @ApiOperation({ summary: '사용자 계정 잠금 해제 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 계정 잠금 해제 성공',
    schema: { $ref: getSchemaPath(UpdateUserLockResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async unlockUser(@Param('id') id: string): Promise<UpdateUserLockResponse> {
    const userId = String(id);
    const unlockedUser =
      await this.adminUserService.unlockAccountByAdmin(userId);

    return {
      success: true,
      message: 'User unlocked successfully',
      data: {
        id: unlockedUser.id,
        lockedUntil: unlockedUser.lockedUntil,
        loginAttemptCount: unlockedUser.loginAttemptCount,
        updatedAt: unlockedUser.updatedAt,
      },
    };
  }

  @Put(':id/password')
  @ApiOperation({ summary: '사용자 비밀번호 변경 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
    schema: { $ref: getSchemaPath(ChangePasswordResponse) },
  })
  @ApiResponse({
    status: 400,
    description: '비밀번호 정책 위반',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Password Validation Failed' },
        message: {
          type: 'string',
          example: '비밀번호가 보안 정책을 만족하지 않습니다.',
        },
        details: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '비밀번호는 최소 8자 이상이어야 합니다.',
            '비밀번호에 숫자가 포함되어야 합니다.',
            '새 비밀번호는 기존 비밀번호와 달라야 합니다.',
          ],
        },
        timestamp: { type: 'string', format: 'date-time' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async changeUserPassword(
    @Param('id') id: string,
    @Body() body: ChangeUserPasswordRequest,
    @CurrentUser() admin: any
  ): Promise<ChangePasswordResponse> {
    await this.adminUserService.changePasswordByAdmin(
      id,
      body.newPassword,
      admin.id,
      body.reason
    );

    return {
      success: true,
      message: 'Password changed successfully',
      data: {
        userId: id,
        changedAt: new Date(),
        changedBy: admin.id,
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제 (관리자)' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: '12345' })
  @ApiResponse({
    status: 200,
    description: '사용자 삭제 성공',
    schema: { $ref: getSchemaPath(DeleteUserResponse) },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async deleteUser(@Param('id') id: string): Promise<DeleteUserResponse> {
    await this.adminUserService.softDelete(id);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Put(':id/reset-password')
  @ApiOperation({
    summary: '사용자 비밀번호 초기화 (관리자)',
    description: `관리자가 사용자의 비밀번호를 보안 정책에 맞는 랜덤 비밀번호로 초기화합니다.
    
**주요 기능:**
- 8-20자 범위의 임시 비밀번호 생성
- 대문자, 소문자, 숫자, 특수문자 각각 최소 1개 포함 보장
- 생성된 비밀번호의 강도 자동 측정
- 초기화 사유 및 관리자 이력 기록
- 모든 보안 정책 통과할 때까지 자동 재생성

**생성 알고리즘:**
1. 각 문자 카테고리에서 1개씩 선택 (4자)
2. 나머지 길이만큼 전체 문자셋에서 랜덤 선택  
3. 문자열 무작위 섞기 (Fisher-Yates shuffle)
4. 보안 정책 검증 (실패 시 재생성)
5. 강도 평가 및 반환`,
  })
  @ApiParam({
    name: 'id',
    description: '비밀번호를 초기화할 사용자의 고유 ID',
    example: '12345',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 초기화 성공 - 새로운 임시 비밀번호와 강도 정보 반환',
    schema: { $ref: getSchemaPath(ResetPasswordResponse) },
    examples: {
      success: {
        summary: '성공적인 비밀번호 초기화',
        value: {
          success: true,
          message: 'Password reset successfully',
          data: {
            temporaryPassword: 'Kx9#mP2vQ8wR!n',
            passwordStrength: 5,
            passwordStrengthText: '매우 강함',
            resetAt: '2025-09-23T12:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 - 유효하지 않은 사용자 ID 또는 비밀번호 길이',
    schema: {
      example: {
        success: false,
        message: 'Invalid password length. Must be between 8 and 20 characters',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 - 유효하지 않은 토큰',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 - 관리자 권한 필요',
    schema: {
      example: {
        success: false,
        message: 'Admin role required for password reset',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자 없음 - 해당 ID의 사용자가 존재하지 않음',
    schema: {
      example: {
        success: false,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async resetUserPassword(
    @Param('id') id: string,
    @Body() body: ResetPasswordRequest,
    @CurrentUser() admin: any
  ): Promise<ResetPasswordResponse> {
    const result = await this.adminUserService.resetPasswordByAdmin(
      id,
      admin.id,
      body.passwordLength || 12,
      body.reason
    );

    return {
      success: true,
      message: 'Password reset successfully',
      data: {
        temporaryPassword: result.temporaryPassword,
        passwordStrength: result.passwordStrength,
        passwordStrengthText: result.passwordStrengthText,
        resetAt: new Date().toISOString(),
      },
    };
  }
}
