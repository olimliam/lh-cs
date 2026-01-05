import {
  Body,
  Controller,
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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConsultationService } from '../../application/service/consultation.service';

import { ConsultationStatsQuery } from '@/application/dto/query/consultation-stats.query';
import { CommonResponse } from '../../common/dto/common-response.dto';
import {
  ConsultationErrorCode,
  ConsultationErrorData,
} from '../../common/exception/error/consultation-error-code.enum';
import {
  ConsultationResponse,
  ConsultationFullResponse,
  ConsultationVisitorInfoResponse,
} from '../dto/response';
import {
  CreateConsultationRequest,
  SearchConsultationRequest,
  StartConsultationRequest,
} from '../dto/request';
import { ResponsePayload } from '@/common/dto/response-payload.dto';
import { ConsultationStatus } from '@/infrastructure/repository/entity/consultation.entity';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { UserEntity } from '@/infrastructure/repository/entity';

@ApiTags('상담실 관리')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  // ========== 상담실 생성 및 관리 ==========

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담실 생성',
    description: '새로운 상담실을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '상담실이 성공적으로 생성되었습니다.',
    type: CommonResponse<ConsultationResponse>,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @HttpCode(HttpStatus.CREATED)
  async createConsultation(
    @Body() createDto: CreateConsultationRequest,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationResponse>> {
    const consultation = await this.consultationService.createConsultation(
      createDto.toCommand(`${user.id}`)
    );

    return {
      data: consultation,
      code: ConsultationErrorCode.CONSULTATION_CREATED,
      message:
        ConsultationErrorData[ConsultationErrorCode.CONSULTATION_CREATED]
          .message,
    };
  }

  @Put(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담 시작',
    description: '방문자를 할당하고 상담을 시작합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '상담이 성공적으로 시작되었습니다.',
    type: CommonResponse<null>,
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '시작할 수 없는 상태의 상담실입니다.',
  })
  @HttpCode(HttpStatus.OK)
  async startConsultation(
    @Param('id') id: string,
    @Body() startDto: StartConsultationRequest,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<null>> {
    await this.consultationService.startConsultation(
      id,
      startDto.toCommand(),
      user
    );

    return {
      data: null,
      code: ConsultationErrorCode.CONSULTATION_STARTED,
      message:
        ConsultationErrorData[ConsultationErrorCode.CONSULTATION_STARTED]
          .message,
    };
  }

  @Put(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담 종료 요청',
    description: '상담 종료를 요청합니다. 5분 후에 실제로 종료됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '상담 종료가 요청되었습니다. 5분 후에 종료됩니다.',
    type: CommonResponse<null>,
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '이미 종료중인 상담실 입니다.',
  })
  @HttpCode(HttpStatus.OK)
  async requestEndConsultation(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<null>> {
    await this.consultationService.requestEndConsultation(id, user);

    return {
      data: null,
      code: ConsultationErrorCode.CONSULTATION_ENDED,
      message:
        ConsultationErrorData[ConsultationErrorCode.CONSULTATION_ENDED].message,
    };
  }

  @Put(':id/restart')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담 재시작',
    description: '종료 중인 상담을 다시 대기 상태로 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '상담이 성공적으로 재시작되었습니다.',
    type: CommonResponse<null>,
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '종료 중인 상담실만 재시작할 수 있습니다.',
  })
  @HttpCode(HttpStatus.OK)
  async restartConsultation(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<null>> {
    await this.consultationService.restartConsultation(id, user);

    return {
      data: null,
      code: ConsultationErrorCode.CONSULTATION_STARTED,
      message: '상담이 재시작되었습니다.',
    };
  }

  // ========== 상담실 조회 ==========

  @UseGuards(JwtAuthGuard)
  @Get('active')
  @ApiOperation({
    summary: '활성 상담실 목록 조회',
    description: '사용자의 모든 활성 상담실을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '활성 상담실 목록 조회 성공',
    type: CommonResponse<ConsultationResponse[]>,
  })
  async getActiveConsultations(
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationResponse[]>> {
    const consultations =
      await this.consultationService.getAllActiveConsultations(user.id);

    return {
      data: consultations,
      code: ConsultationErrorCode.OK,
      message: '활성 상담실 목록 조회 성공',
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담실 통계 조회',
    description: '대시보드용 상담실 통계 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    type: CommonResponse<ConsultationStatsQuery>,
  })
  async getConsultationStats(
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationStatsQuery>> {
    const stats = await this.consultationService.getConsultationStats(user);

    return {
      data: stats,
      code: ConsultationErrorCode.OK,
      message: '통계 조회 성공',
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담실 검색',
    description: '조건에 따라 상담실을 검색합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과',
    type: CommonResponse<ConsultationResponse[]>,
  })
  async searchConsultations(
    @Query() request: SearchConsultationRequest,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationResponse[]>> {
    const consultations = await this.consultationService.searchConsultations(
      request.toQuery(),
      user
    );

    return {
      data: consultations,
      code: ConsultationErrorCode.OK,
      message: '상담실 검색 완료',
    };
  }

  @Get('enter/:enterCode')
  @ApiOperation({
    summary: '입장 코드로 상담실 찾기',
    description: '입장 코드를 사용하여 상담실을 찾습니다.',
  })
  @ApiParam({
    name: 'enterCode',
    description: '입장 코드',
    type: 'string',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 200,
    description: '상담실 조회 성공',
    type: CommonResponse<ConsultationResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '유효하지 않은 입장 코드',
  })
  async findByEnterCode(
    @Param('enterCode') enterCode: string
  ): Promise<ResponsePayload<ConsultationResponse>> {
    const consultation =
      await this.consultationService.findConsultationByEnterCode(enterCode);

    return {
      data: consultation,
      code: ConsultationErrorCode.OK,
      message: '상담실 조회 성공',
    };
  }

  @Get(':id/full')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담실 + 투어 + 시설 상세 조회',
    description: '상담실 정보와 투어, 투어 시설 목록을 한 번에 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '상담실 전체 정보 조회 성공',
    type: CommonResponse<ConsultationFullResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  async getConsultationFullById(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationFullResponse>> {
    const consultation = await this.consultationService.getConsultationFullById(
      id,
      user
    );

    return {
      data: consultation,
      code: ConsultationErrorCode.OK,
      message: '상담실 전체 정보 조회 성공',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '상담실 상세 조회',
    description: 'ID로 상담실 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '상담실 상세 조회 성공',
    type: CommonResponse<ConsultationResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  async getConsultationById(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ResponsePayload<ConsultationResponse>> {
    const consultation = await this.consultationService.getConsultationById(
      id,
      user
    );

    return {
      data: consultation,
      code: ConsultationErrorCode.OK,
      message: '상담실 상세 조회 성공',
    };
  }

  @Put(':id/status/connection')
  @ApiOperation({
    summary: '연결 상태에 따른 상담실 상태 업데이트',
    description: 'WebSocket 연결 상태에 따라 상담실 상태를 업데이트합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '상담실 상태가 성공적으로 업데이트되었습니다.',
    type: CommonResponse<null>,
  })
  @HttpCode(HttpStatus.OK)
  async updateConsultationStatusByConnection(
    @Param('id') id: string,
    @Body()
    updateDto: { isAdminConnected: boolean; isVisitorConnected: boolean }
  ): Promise<ResponsePayload<ConsultationStatus | null>> {
    return this.consultationService.updateConsultationStatusByConnection(
      id,
      updateDto.isAdminConnected,
      updateDto.isVisitorConnected
    );
  }

  @Post(':id/visitor-info')
  @ApiOperation({
    summary: '상담실 방문자 정보 조회',
    description: '상담 ID로 방문자 ID와 평형·시설 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '상담실 ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '방문자 및 상담 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: { type: 'string', example: '방문자 정보 조회 성공' },
        data: {
          type: 'object',
          properties: {
            visitorId: {
              type: 'string',
              nullable: true,
              description: '방문자 ID (없으면 null)',
            },
            squareMeters: {
              type: 'integer',
              nullable: true,
              description: '투어 평형 정보 (제곱미터 단위)',
            },
            facilityName: {
              type: 'string',
              nullable: true,
              description: '시작 시설 이름 (startTourFacilityId 기준)',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상담실을 찾을 수 없습니다.',
  })
  async getConsultationVisitorInfo(
    @Param('id') consultationId: string
  ): Promise<ResponsePayload<ConsultationVisitorInfoResponse>> {
    const result =
      await this.consultationService.getConsultationVisitorInfo(consultationId);

    return {
      data: result,
      code: ConsultationErrorCode.OK,
      message: '방문자 정보 조회 성공',
    };
  }
}
