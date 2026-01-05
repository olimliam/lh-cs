import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { UpdateUserUseCasePayload } from '@/application/use-case/user/update-user.use-case';

const transformOptionalString = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

export class UpdateUserRequest {
  @ApiPropertyOptional({
    description: '로그인 아이디 (숫자 6~20자리)',
    example: '123456',
  })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @Matches(/^\d{6,20}$/, {
    message: '아이디는 숫자 6~20자리여야 합니다.',
  })
  username?: string;

  @ApiPropertyOptional({ description: '사용자 이름', example: '홍길동' })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '부서', example: '상담운영팀' })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://cdn.example.com/profile.png',
    nullable: true,
  })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: '사용자 역할',
    enum: UserRoleEnum,
    example: UserRoleEnum.CONSULTANT,
  })
  @IsEnum(UserRoleEnum)
  @IsOptional()
  role?: UserRoleEnum;

  @ApiPropertyOptional({
    description: '사용자 상태',
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
  })
  @IsEnum(UserStatusEnum)
  @IsOptional()
  status?: UserStatusEnum;

  @ApiPropertyOptional({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
    example: UserApprovalStatusEnum.APPROVED,
  })
  @IsEnum(UserApprovalStatusEnum)
  @IsOptional()
  approvalStatus?: UserApprovalStatusEnum;

  @ApiPropertyOptional({
    description: '프로필 이미지 수정 여부',
    example: false,
  })
  @IsBooleanAndBooleanString({ optional: true })
  isEditProfileImage?: boolean;
}

export class UpdateUserFormRequest extends UpdateUserRequest {
  @ApiPropertyOptional({
    description: '업로드할 프로필 이미지 파일',
    type: 'string',
    format: 'binary',
  })
  profileImage?: string;
}

export const toUpdateUserPayload = (
  request: UpdateUserRequest
): UpdateUserUseCasePayload => {
  const payload: UpdateUserUseCasePayload = {};

  if (typeof request.username !== 'undefined') {
    payload.username = request.username;
  }

  if (typeof request.name !== 'undefined') {
    payload.name = request.name;
  }

  if (typeof request.department !== 'undefined') {
    payload.department = request.department;
  }

  if (typeof request.phoneNumber !== 'undefined') {
    payload.phoneNumber = request.phoneNumber;
  }

  if (typeof request.profileImageUrl !== 'undefined') {
    payload.profileImageUrl = request.profileImageUrl;
  }

  if (typeof request.role !== 'undefined') {
    payload.role = request.role;
  }

  if (typeof request.status !== 'undefined') {
    payload.status = request.status;
  }

  if (typeof request.approvalStatus !== 'undefined') {
    payload.approvalStatus = request.approvalStatus;
  }

  return payload;
};
