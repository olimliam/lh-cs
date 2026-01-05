import { UpdateFacilityCommand } from '@/application/dto/command/update-facility.command';
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateFacilityCommand } from '../../application/dto/command/create-facility.command';
import { FacilityService } from '../../application/service/facility.service';
import { CommonResponse } from '../../common/dto/common-response.dto';
import { FacilityErrorCode } from '@/common/exception/error/facility-error-code.enum';
import { ResponsePayload } from '@/common/dto/response-payload.dto';
import {
  ErrorResponse,
  ValidationErrorResponse,
} from '../dto/response/error.response';
import { FacilityResponse } from '../dto/response/facility.response';

@ApiTags('시설 관리')
@ApiBearerAuth()
@Controller('facilities')
@ApiExtraModels(FacilityResponse, ErrorResponse, ValidationErrorResponse)
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Post()
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '시설 생성',
    description:
      '새로운 시설을 생성합니다. 시설은 독립적으로 관리되며 여러 투어에서 재사용할 수 있습니다.',
  })
  @ApiResponse({
    status: 201,
    description: '시설이 성공적으로 생성되었습니다.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(FacilityResponse) },
          },
        },
      ],
    },
    example: {
      success: true,
      data: {
        id: '123',
        title: '거실 조명',
        description: '메인 거실 LED 조명 시스템',
        isActive: true,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      },
      message: '시설이 성공적으로 생성되었습니다.',
      timestamp: '2024-01-15T09:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
    schema: { $ref: getSchemaPath(ValidationErrorResponse) },
    example: {
      statusCode: 400,
      message: ['시설명은 필수입니다.', '시설명은 50자 이하여야 합니다.'],
      error: 'Bad Request',
      timestamp: '2024-01-15T09:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @HttpCode(HttpStatus.CREATED)
  async createFacility(
    @Body() createDto: CreateFacilityCommand
  ): Promise<ResponsePayload<FacilityResponse>> {
    const facility = await this.facilityService.createFacility(createDto);

    return {
      data: facility,
      code: FacilityErrorCode.FACILITY_CREATED,
    };
  }

  @Get()
  @ApiOperation({
    summary: '시설 목록 조회',
    description:
      '모든 시설 목록을 조회합니다. 활성/비활성 상태로 필터링이 가능합니다.',
  })
  @ApiQuery({
    name: 'isActive',
    description:
      '활성화 상태 필터 (true: 활성 시설만, false: 비활성 시설만, 미지정: 모든 시설)',
    type: 'boolean',
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: '시설 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(FacilityResponse) },
            },
          },
        },
      ],
    },
    example: {
      success: true,
      data: [
        {
          id: '1',
          title: '거실 조명',
          description: '메인 거실 LED 조명 시스템',
          isActive: true,
          createdAt: '2024-01-15T09:30:00.000Z',
          updatedAt: '2024-01-15T09:30:00.000Z',
        },
        {
          id: '2',
          title: '시스템 키친',
          description: '빌트인 주방 가구 시설',
          isActive: true,
          createdAt: '2024-01-15T09:45:00.000Z',
          updatedAt: '2024-01-15T09:45:00.000Z',
        },
      ],
      message: '시설 목록 조회 성공',
      timestamp: '2024-01-15T09:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  async getAllFacilities(
    @Query('isActive') isActive?: boolean
  ): Promise<ResponsePayload<FacilityResponse[]>> {
    const facilities = await this.facilityService.getAllFacilities(isActive);

    return {
      data: facilities,
      code: FacilityErrorCode.FACILITY_LIST_FETCHED,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '시설 상세 조회',
    description: 'ID로 시설 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '시설 ID',
    type: 'string',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: '시설 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(FacilityResponse) },
          },
        },
      ],
    },
    example: {
      success: true,
      data: {
        id: '123',
        title: '거실 조명',
        description: '메인 거실 LED 조명 시스템',
        isActive: true,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      },
      message: '시설 상세 조회 성공',
      timestamp: '2024-01-15T09:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없습니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
    example: {
      statusCode: 404,
      message: '시설을 찾을 수 없습니다.',
      error: 'Not Found',
      timestamp: '2024-01-15T09:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  async getFacilityById(
    @Param('id') id: string
  ): Promise<ResponsePayload<FacilityResponse>> {
    const facility = await this.facilityService.getFacilityById(id);

    return {
      data: facility,
      code: FacilityErrorCode.FACILITY_FETCHED,
    };
  }

  @Put(':id')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '시설 수정',
    description: '시설 정보를 수정합니다. 제공된 필드만 업데이트됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '시설 ID',
    type: 'string',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: '시설이 성공적으로 수정되었습니다.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(FacilityResponse) },
          },
        },
      ],
    },
    example: {
      success: true,
      data: {
        id: '123',
        title: '수정된 거실 조명',
        description: '업데이트된 메인 거실 LED 조명 시스템',
        isActive: true,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T10:15:00.000Z',
      },
      message: '시설이 성공적으로 수정되었습니다.',
      timestamp: '2024-01-15T10:15:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
    schema: { $ref: getSchemaPath(ValidationErrorResponse) },
  })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없습니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @HttpCode(HttpStatus.OK)
  async updateFacility(
    @Param('id') id: string,
    @Body() updateDto: UpdateFacilityCommand
  ): Promise<ResponsePayload<FacilityResponse>> {
    const facility = await this.facilityService.updateFacility(id, updateDto);

    return {
      data: facility,
      code: FacilityErrorCode.FACILITY_UPDATED_SUCCESS,
    };
  }

  @Delete(':id')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '시설 삭제 (소프트)',
    description:
      '시설을 소프트 삭제합니다. 시설이 비활성화되지만 데이터는 보존됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '시설 ID',
    type: 'string',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: '시설이 성공적으로 삭제되었습니다.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { type: 'null' },
          },
        },
      ],
    },
    example: {
      success: true,
      data: null,
      message: '시설이 성공적으로 삭제되었습니다.',
      timestamp: '2024-01-15T10:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없습니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @HttpCode(HttpStatus.OK)
  async deleteFacility(
    @Param('id') id: string
  ): Promise<ResponsePayload<null>> {
    await this.facilityService.deleteFacility(id);

    return {
      data: null,
      code: FacilityErrorCode.FACILITY_DELETED_SUCCESS,
    };
  }

  @Delete(':id/hard')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '시설 완전 삭제',
    description:
      '시설을 완전히 삭제합니다. ⚠️ 주의: 이 작업은 되돌릴 수 없습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '시설 ID',
    type: 'string',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: '시설이 완전히 삭제되었습니다.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            data: { type: 'null' },
          },
        },
      ],
    },
    example: {
      success: true,
      data: null,
      message: '시설이 완전히 삭제되었습니다.',
      timestamp: '2024-01-15T10:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없습니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @ApiResponse({
    status: 401,
    description: '인증이 필요합니다.',
    schema: { $ref: getSchemaPath(ErrorResponse) },
  })
  @HttpCode(HttpStatus.OK)
  async hardDeleteFacility(
    @Param('id') id: string
  ): Promise<ResponsePayload<null>> {
    await this.facilityService.hardDeleteFacility(id);

    return {
      data: null,
      code: FacilityErrorCode.FACILITY_HARD_DELETED_SUCCESS,
    };
  }
}
