import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDataResponse {
  @ApiProperty({ description: '사용자 ID', example: '4' })
  id: string;

  @ApiProperty({ description: '로그인 아이디', example: 'user01' })
  username: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  name: string;

  @ApiPropertyOptional({
    description: '전화번호',
    example: '01012345678',
    nullable: true,
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://cdn.example.com/avatar.png',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '소속 부서',
    example: '상담운영팀',
    nullable: true,
  })
  department?: string | null;

  @ApiProperty({ description: '프로필 수정 시각', format: 'date-time' })
  updatedAt: string;
}

export class UpdateProfileResponse {
  @ApiProperty({ description: '요청 성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '결과 메시지', example: 'Profile updated successfully' })
  message: string;

  @ApiProperty({ description: '수정된 사용자 정보', type: UpdateProfileDataResponse })
  data: UpdateProfileDataResponse;
}
