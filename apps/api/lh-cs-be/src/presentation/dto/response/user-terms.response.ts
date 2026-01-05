import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserTermsStatus } from '@/application/service/user-terms.service';

export class UserTermsItemResponse {
  @ApiProperty({ description: '약관 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '약관 제목', example: '개인정보 처리방침' })
  title: string;

  @ApiProperty({ description: '약관 버전', example: 'v1.0' })
  version: string;

  @ApiProperty({ description: '필수 동의 여부', example: true })
  isRequired: boolean;

  @ApiProperty({ description: '약관 본문', example: '...약관 내용...' })
  content: string;

  @ApiPropertyOptional({
    description: '공개 일시',
    example: '2024-08-01T00:00:00.000Z',
  })
  publishedAt?: Date;

  @ApiPropertyOptional({
    description: '동의 일시',
    example: '2024-08-10T09:00:00.000Z',
  })
  agreedAt?: Date | null;

  static from(status: UserTermsStatus): UserTermsItemResponse {
    const response = new UserTermsItemResponse();
    response.id = status.id;
    response.title = status.title;
    response.version = status.version;
    response.isRequired = status.isRequired;
    response.content = status.content;
    response.publishedAt = status.publishedAt;
    response.agreedAt = status.agreedAt ?? null;
    return response;
  }
}

export class UserTermsListResponse {
  @ApiProperty({ description: 'API 처리 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '약관 동의 현황',
    type: [UserTermsItemResponse],
  })
  data: UserTermsItemResponse[];

  static from(statusList: UserTermsStatus[]): UserTermsListResponse {
    const response = new UserTermsListResponse();
    response.success = true;
    response.data = statusList.map(UserTermsItemResponse.from);
    return response;
  }
}
