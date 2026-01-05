import { ApiProperty } from '@nestjs/swagger';
import { LoginAllowedIpEntity } from '@/infrastructure/repository/entity/login-allowed-ip.entity';
import { PaginationResDto } from '@/common/dto/pagination.dto';

export class LoginAllowedIpResponse {
  @ApiProperty({ description: '식별자', example: '1' })
  id: string;

  @ApiProperty({
    description: 'IP 주소',
    example: '203.0.113.10',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'IP 설명',
    example: '서울 본사 VPN',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: '허용 여부 (true: 허용, false: 차단)',
    example: true,
  })
  isAllowed: boolean;

  @ApiProperty({
    description: 'IP를 등록한 관리자 username',
    example: '000000',
  })
  createdBy: string;

  @ApiProperty({
    description: '생성 일시',
    example: '2024-12-10T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: '2024-12-11T09:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(entity: LoginAllowedIpEntity): LoginAllowedIpResponse {
    return {
      id: entity.id,
      ipAddress: entity.ipAddress,
      description: entity.description ?? null,
      isAllowed: entity.isActive,
      createdBy: entity.user ? entity.user.username : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static fromEntities(
    entities: LoginAllowedIpEntity[]
  ): LoginAllowedIpResponse[] {
    return entities.map(LoginAllowedIpResponse.fromEntity);
  }
}

export class PaginatedLoginAllowedIpResponse extends PaginationResDto<LoginAllowedIpResponse> {
  static from(
    data: LoginAllowedIpEntity[],
    total: number,
    page: number,
    limit: number
  ): PaginatedLoginAllowedIpResponse {
    const totalPages = Math.ceil(total / limit) || 1;
    return new PaginatedLoginAllowedIpResponse({
      data: data.map(LoginAllowedIpResponse.fromEntity),
      total,
      page,
      limit,
      totalPages,
    });
  }
}
