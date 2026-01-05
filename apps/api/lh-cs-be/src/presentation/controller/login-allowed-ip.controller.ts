import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { LoginAllowedIpService } from '@/application/service/login-allowed-ip.service';
import { CreateLoginAllowedIpCommand } from '@/application/dto/command/create-login-allowed-ip.command';
import { UpdateLoginAllowedIpCommand } from '@/application/dto/command/update-login-allowed-ip.command';
import {
  LoginAllowedIpResponse,
  PaginatedLoginAllowedIpResponse,
} from '@/presentation/dto/response/login-allowed-ip.response';
import { CommonResponse } from '@/common/dto/common-response.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { GetLoginAllowedIpsRequest } from '@/presentation/dto/request';

@ApiTags('관리 - 로그인 허용 IP')
@ApiBearerAuth('bearer')
@ApiExtraModels(
  CommonResponse,
  LoginAllowedIpResponse,
  PaginatedLoginAllowedIpResponse
)
@Controller('admin/login-allowed-ips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.SUPER_ADMIN)
export class LoginAllowedIpController {
  constructor(private readonly loginAllowedIpService: LoginAllowedIpService) {}

  @Get()
  @ApiOperation({ summary: '로그인 허용/차단 IP 목록 조회' })
  @ApiResponse({
    status: 200,
    description: 'IP 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(PaginatedLoginAllowedIpResponse) },
          },
        },
      ],
    },
  })
  async getAll(
    @Query() query: GetLoginAllowedIpsRequest
  ): Promise<CommonResponse<PaginatedLoginAllowedIpResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const items = await this.loginAllowedIpService.getPaginated({
      page,
      limit,
      orderDirection: query.orderDirection ?? 'DESC',
    });
    return CommonResponse.success(items);
  }

  @Post()
  @ApiOperation({ summary: '로그인 허용/차단 IP 등록' })
  @ApiBody({ type: CreateLoginAllowedIpCommand })
  @ApiResponse({
    status: 201,
    description: 'IP 등록 성공',
    type: CommonResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() command: CreateLoginAllowedIpCommand,
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<LoginAllowedIpResponse>> {
    console.log('create controller: ', currentUser);
    const created = await this.loginAllowedIpService.create(
      command,
      currentUser
    );
    return CommonResponse.success(created);
  }

  @Put(':id')
  @ApiOperation({ summary: '로그인 허용/차단 IP 수정' })
  @ApiParam({ name: 'id', description: 'IP 식별자', type: Number })
  @ApiBody({ type: UpdateLoginAllowedIpCommand })
  @ApiResponse({
    status: 200,
    description: 'IP 수정 성공',
    type: CommonResponse,
  })
  async update(
    @Param('id') id: string,
    @Body() command: UpdateLoginAllowedIpCommand,
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<LoginAllowedIpResponse>> {
    const updated = await this.loginAllowedIpService.update(
      id,
      command,
      currentUser
    );
    return CommonResponse.success(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: '로그인 허용/차단 IP 삭제' })
  @ApiParam({ name: 'id', description: 'IP 식별자', type: Number })
  @ApiResponse({
    status: 200,
    description: 'IP 삭제 성공',
    type: CommonResponse,
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<null>> {
    await this.loginAllowedIpService.delete(id, currentUser);
    return CommonResponse.success(null);
  }
}
