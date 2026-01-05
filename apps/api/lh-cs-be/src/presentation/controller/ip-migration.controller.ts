import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { IpMigrationService } from '@/application/service/ip-migration.service';
import { CommonResponse } from '@/common/dto/common-response.dto';

@ApiTags('관리 - IP 마이그레이션')
@ApiBearerAuth('bearer')
@Controller('admin/ip-migration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.SUPER_ADMIN)
export class IpMigrationController {
  constructor(private readonly ipMigrationService: IpMigrationService) {}

  @Post('encrypt-existing-ips')
  @ApiOperation({
    summary: 'DB에 존재하는 평문 IP를 일괄 암호화',
    description:
      '이미 저장된 IP 컬럼 중 암호화되지 않은 값을 AES-256-GCM 포맷으로 암호화합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '마이그레이션 결과 반환',
    type: CommonResponse,
  })
  async migrate(): Promise<
    CommonResponse<
      {
        table: string;
        updated: number;
      }[]
    >
  > {
    const result = await this.ipMigrationService.migrateAll();
    return CommonResponse.success(result, undefined, 'IP 암호화 마이그레이션 완료');
  }
}
