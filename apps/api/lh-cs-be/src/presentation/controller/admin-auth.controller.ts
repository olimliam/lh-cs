import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CommonResponse } from '@/common/dto/common-response.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { PhoneVerificationService } from '@/application/service/phone-verification.service';
import { AdminPhoneVerificationRequest } from '../dto/request/admin-phone-verification.request';
import { AdminPhoneVerificationResponse } from '../dto/response/admin-phone-verification.response';

@ApiTags('Admin - Auth')
@Controller('admin/auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@ApiBearerAuth('bearer')
@ApiExtraModels(CommonResponse, AdminPhoneVerificationResponse)
export class AdminAuthController {
  constructor(
    private readonly phoneVerificationService: PhoneVerificationService
  ) {}

  @Get('phone-verification')
  @ApiOperation({ summary: '전화번호 인증번호 조회 (관리자 전용)' })
  @ApiQuery({
    name: 'phoneNumber',
    required: true,
    description: '조회할 전화번호',
  })
  @ApiOkResponse({
    description: '인증번호 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(AdminPhoneVerificationResponse) },
          },
        },
      ],
    },
  })
  async getPhoneVerification(
    @Query() query: AdminPhoneVerificationRequest
  ): Promise<CommonResponse<AdminPhoneVerificationResponse>> {
    const result = await this.phoneVerificationService.getLatestVerificationForAdmin(
      query.phoneNumber
    );

    return CommonResponse.success(result);
  }
}
