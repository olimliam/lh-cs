import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponse } from './get-users.response';

export class PendingRegistrationItemResponse {
  @ApiProperty({ description: '사용자 ID', example: '123' })
  userId: string;

  @ApiProperty({ description: '로그인 아이디(username)', example: 'user01' })
  username: string;

  @ApiProperty({ description: '이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '부서', example: '상담운영팀', nullable: true })
  department?: string | null;

  @ApiProperty({ description: '전화번호', example: '01012345678', nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ description: '가입 신청일', example: '2024-12-10T09:00:00.000Z' })
  signedAt: Date;

  @ApiProperty({
    description: '승인 완료 일시',
    example: '2024-12-12T09:30:00.000Z',
    nullable: true,
  })
  approvedAt?: Date | null;

  @ApiProperty({
    description: '승인 처리 관리자 아이디(username)',
    example: 'admin01',
    nullable: true,
  })
  approvedBy?: string | null;
}

export class PendingRegistrationsResponseData {
  @ApiProperty({ type: () => [PendingRegistrationItemResponse] })
  items: PendingRegistrationItemResponse[];

  @ApiProperty({ type: () => PaginationResponse })
  pagination: PaginationResponse;
}

export class PendingRegistrationsResponse {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '데이터 및 페이지네이션 정보',
    type: () => PendingRegistrationsResponseData,
  })
  data: PendingRegistrationsResponseData;
}

export class RejectionHistoryItemResponse {
  @ApiProperty({ description: '사용자 ID', example: '123' })
  userId: string;

  @ApiProperty({
    description: '로그인 아이디(username)',
    example: 'user02',
    nullable: true,
  })
  username: string | null;

  @ApiProperty({ description: '부서', example: '상담운영팀', nullable: true })
  department?: string | null;

  @ApiProperty({ description: '가입 신청일', example: '2024-12-01T00:00:00.000Z' })
  signedAt: Date;

  @ApiProperty({ description: '거절 일시', example: '2024-12-10T10:15:00.000Z' })
  rejectedAt: Date;

  @ApiProperty({
    description: '거절 처리 관리자 아이디(username)',
    example: 'admin01',
    nullable: true,
  })
  rejectedBy: string | null;

  @ApiProperty({ description: '거절 사유', nullable: true, example: '자격 요건 미충족' })
  reason?: string | null;
}

export class RejectionHistoryResponseData {
  @ApiProperty({ type: () => [RejectionHistoryItemResponse] })
  items: RejectionHistoryItemResponse[];

  @ApiProperty({ type: () => PaginationResponse })
  pagination: PaginationResponse;
}

export class RejectionHistoryResponse {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '데이터 및 페이지네이션 정보',
    type: () => RejectionHistoryResponseData,
  })
  data: RejectionHistoryResponseData;
}
