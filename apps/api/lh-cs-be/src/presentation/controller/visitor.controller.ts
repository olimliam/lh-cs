import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../../application/service/auth.service';
import { VisitorAuthRequest } from '../dto/request/visitor-auth.request';
import { VisitorIdCheckRequest } from '../dto/request/visitor-id-check.request';
import { VisitorAuthResponse } from '../dto/response/visitor-auth.response';
import { VisitorIdCheckResponse } from '../dto/response/visitor-id-check.response';

@ApiTags('방문자 인증')
@Controller('visitor')
export class VisitorController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Visitor 인증 (enterCode로 상담실 입장)',
    description: '입장 코드를 사용하여 방문자 인증을 수행합니다. 토큰 인증이 필요하지 않습니다.'
  })
  @ApiBody({ type: VisitorAuthRequest })
  @ApiResponse({
    status: 200,
    description: 'Visitor 인증 성공',
    type: VisitorAuthResponse,
  })
  @ApiResponse({ status: 401, description: '잘못된 입장 코드' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async authenticateVisitor(
    @Body() visitorAuthDto: VisitorAuthRequest
  ): Promise<VisitorAuthResponse> {
    return await this.authService.authenticateVisitor(visitorAuthDto);
  }

  @Post(':visitorId/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Visitor ID 검증 및 상담 상태 확인',
    description: '방문자 ID를 검증하고 현재 상담 상태를 확인합니다. 토큰 인증이 필요하지 않습니다.'
  })
  @ApiParam({
    name: 'visitorId',
    description: '검증할 방문자 ID',
    type: 'string',
    example: 'visitor-uuid-123',
  })
  @ApiBody({ type: VisitorIdCheckRequest })
  @ApiResponse({
    status: 200,
    description: 'Visitor ID 검증 성공',
    type: VisitorIdCheckResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async checkVisitorId(
    @Param('visitorId') visitorId: string,
    @Body() checkDto: VisitorIdCheckRequest
  ): Promise<VisitorIdCheckResponse> {
    return await this.authService.checkVisitorId(visitorId, checkDto);
  }
}
