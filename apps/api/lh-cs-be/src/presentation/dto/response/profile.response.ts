import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDataResponse {
  @ApiProperty({ description: '사용자 ID', example: '4' })
  id: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '로그인 아이디', example: 'user01' })
  username: string;

  @ApiProperty({ description: '사용자 역할', enum: UserRoleEnum })
  role: UserRoleEnum;

  @ApiProperty({ description: '계정 상태', enum: UserStatusEnum })
  status: UserStatusEnum;

  @ApiProperty({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://cdn.example.com/avatar.png',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '전화번호',
    example: '01012345678',
    nullable: true,
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: '소속 부서',
    example: '공동주택관리지원실',
    nullable: true,
  })
  department?: string | null;

  @ApiPropertyOptional({
    description: '마지막 로그인 시간',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt?: string | null;

  @ApiProperty({ description: '계정 생성일', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: '계정 수정일', format: 'date-time' })
  updatedAt: string;

  static from(user: any, phoneNumber?: string | null): ProfileDataResponse {
    const response = new ProfileDataResponse();
    response.id = String(user.id);
    response.name = user.name ?? '';
    response.username = user.username ?? '';
    response.role = user.role;
    response.status = user.status;
    response.approvalStatus = user.approvalStatus;
    response.profileImageUrl = user.profileImageUrl ?? null;
    response.phoneNumber = phoneNumber ?? user.phoneNumber ?? null;
    response.department = user.department ?? null;
    response.lastLoginAt = ProfileDataResponse.convertDate(user.lastLoginAt);
    response.createdAt =
      ProfileDataResponse.convertDate(user.createdAt) ?? new Date().toISOString();
    response.updatedAt =
      ProfileDataResponse.convertDate(user.updatedAt) ?? new Date().toISOString();
    return response;
  }

  private static convertDate(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      return value;
    }

    return null;
  }
}

export class ProfileResponse {
  @ApiProperty({ description: '요청 성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '사용자 프로필 정보', type: ProfileDataResponse })
  data: ProfileDataResponse;

  static success(user: any, phoneNumber?: string | null): ProfileResponse {
    const response = new ProfileResponse();
    response.success = true;
    response.data = ProfileDataResponse.from(user, phoneNumber);
    return response;
  }
}
