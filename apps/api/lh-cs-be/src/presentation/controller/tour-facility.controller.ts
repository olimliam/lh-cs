import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AddFacilityToTourCommand } from '../../application/dto/command/add-facility-to-tour.command';
import { ReorderTourFacilitiesCommand } from '../../application/dto/command/reorder-tour-facilities.command';
import { UpdateTourFacilityCommand } from '../../application/dto/command/update-tour-facility.command';
import { TourFacilityService } from '../../application/service/tour-facility.service';
import { TourFacilityImportService } from '@/application/service/tour-facility-import.service';
import { AddFacilityToTourRequest } from '../dto/request/add-facility-to-tour.request';
import { ReorderTourFacilitiesRequest } from '../dto/request/reorder-tour-facilities.request';
import { UpdateTourFacilityRequest } from '../dto/request/update-tour-facility.request';
import {
  ConflictErrorResponseDto,
  ErrorResponse,
  ValidationErrorResponse,
} from '../dto/response/error.response';
import { TourFacilityResponse } from '../dto/response/tour-facility.response';
import { TourFacilitySceneImportResponse } from '../dto/response/tour-facility-scene-import.response';

@ApiTags('투어 시설 관리')
@Controller('tours')
@ApiBearerAuth()
@ApiExtraModels(
  TourFacilityResponse,
  ErrorResponse,
  ValidationErrorResponse,
  ConflictErrorResponseDto
)
export class TourFacilityController {
  constructor(
    private readonly tourFacilityService: TourFacilityService,
    private readonly tourFacilityImportService: TourFacilityImportService
  ) {}

  @Post(':tourId/facilities')
  // @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '투어에 시설 추가',
    description:
      '특정 투어에 시설을 추가하고 위치 정보를 설정합니다. 동일한 투어-시설-씬 조합은 유일해야 합니다.',
  })
  @ApiParam({
    name: 'tourId',
    description: '투어 ID',
    type: String,
    example: '123',
  })
  @ApiBody({
    type: AddFacilityToTourRequest,
    description: '투어에 추가할 시설 정보',
    examples: {
      basic: {
        summary: '기본 시설 추가',
        description: '카메라 위치 정보와 함께 시설을 추가하는 예시',
        value: {
          facilityId: '456',
          sceneId: '789',
          cameraPosX: 10.5,
          cameraPosY: 20.3,
          cameraPosZ: 15.8,
          isDefaultStart: false,
          displayOrder: 1,
        },
      },
      defaultStart: {
        summary: '기본 시작점으로 시설 추가',
        description: '투어의 기본 시작점으로 설정하여 시설을 추가하는 예시',
        value: {
          facilityId: '456',
          sceneId: '789',
          cameraPosX: 0.0,
          cameraPosY: 1.8,
          cameraPosZ: -5.0,
          isDefaultStart: true,
          displayOrder: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '시설이 성공적으로 추가되었습니다.',
    type: TourFacilityResponse,
    schema: {
      example: {
        id: '999',
        tourId: '123',
        facilityId: '456',
        facilityTitle: 'LED 조명',
        facilityDescription: '에너지 효율적인 LED 조명 시스템',
        sceneId: '789',
        cameraPosX: 10.5,
        cameraPosY: 20.3,
        cameraPosZ: 15.8,
        isDefaultStart: false,
        displayOrder: 1,
        isActive: true,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T09:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ValidationErrorResponse) },
        { $ref: getSchemaPath(ErrorResponse) },
      ],
    },
    examples: {
      validation: {
        summary: '유효성 검사 실패',
        value: {
          statusCode: 400,
          message: ['facilityId는 필수입니다.', 'sceneId는 숫자여야 합니다.'],
          error: 'Bad Request',
          timestamp: '2024-01-15T10:30:00.000Z',
        },
      },
      invalidData: {
        summary: '잘못된 데이터',
        value: {
          statusCode: 400,
          message: '시설 추가에 실패했습니다.',
          error: 'Bad Request',
          timestamp: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '투어 또는 시설을 찾을 수 없습니다.',
    type: ErrorResponse,
    schema: {
      example: {
        statusCode: 404,
        message: '투어를 찾을 수 없습니다.',
        error: 'Not Found',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 해당 위치에 시설이 배치되어 있습니다.',
    type: ConflictErrorResponseDto,
    schema: {
      example: {
        statusCode: 409,
        message: '이미 해당 위치에 시설이 배치되어 있습니다.',
        error: 'Conflict',
        details: {
          tourId: '123',
          facilityId: '456',
          sceneId: '789',
        },
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async addFacilityToTour(
    @Param('tourId') tourId: string,
    @Body() request: AddFacilityToTourRequest
  ): Promise<TourFacilityResponse> {
    const addDto: AddFacilityToTourCommand = {
      tourId: tourId,
      facilityId: request.facilityId,
      sceneId: request.sceneId,
      cameraPosX: request.cameraPosX,
      cameraPosY: request.cameraPosY,
      cameraPosZ: request.cameraPosZ,
      isDefaultStart: request.isDefaultStart,
      displayOrder: request.displayOrder,
    };

    const result = await this.tourFacilityService.addFacilityToTour(addDto);

    return this.mapToResponse(result);
  }

  @Put(':tourId/facilities/:facilityId')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '투어 시설 정보 수정',
    description: '투어에 배치된 시설의 위치나 설정 정보를 수정합니다.',
  })
  @ApiParam({ name: 'tourId', description: '투어 ID', type: String })
  @ApiParam({ name: 'facilityId', description: '투어 시설 ID', type: String })
  @ApiResponse({
    status: 200,
    description: '시설 정보가 성공적으로 수정되었습니다.',
    type: TourFacilityResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '투어 시설을 찾을 수 없습니다.' })
  @ApiResponse({
    status: 409,
    description: '이미 해당 위치에 시설이 배치되어 있습니다.',
  })
  async updateTourFacility(
    @Param('tourId') tourId: string,
    @Param('facilityId') facilityId: string,
    @Body() request: UpdateTourFacilityRequest
  ): Promise<TourFacilityResponse> {
    const updateDto: UpdateTourFacilityCommand = {
      sceneId: request.sceneId ? request.sceneId : undefined,
      cameraPosX: request.cameraPosX,
      cameraPosY: request.cameraPosY,
      cameraPosZ: request.cameraPosZ,
      isDefaultStart: request.isDefaultStart,
      displayOrder: request.displayOrder,
    };

    const result = await this.tourFacilityService.updateTourFacility(
      tourId,
      facilityId,
      updateDto
    );

    return this.mapToResponse(result);
  }

  @Delete(':tourId/facilities/:facilityId')
  // @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '투어에서 시설 제거',
    description: '투어에서 특정 시설을 제거합니다.',
  })
  @ApiParam({ name: 'tourId', description: '투어 ID', type: String })
  @ApiParam({ name: 'facilityId', description: '투어 시설 ID', type: String })
  @ApiResponse({
    status: 204,
    description: '시설이 성공적으로 제거되었습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '투어 시설을 찾을 수 없습니다.' })
  async removeFacilityFromTour(
    @Param('tourId') tourId: string,
    @Param('facilityId') facilityId: string
  ): Promise<void> {
    await this.tourFacilityService.removeFacilityFromTour(tourId, facilityId);
  }

  @Get(':tourId/facilities')
  @ApiOperation({
    summary: '투어의 시설 목록 조회',
    description:
      '특정 투어에 배치된 모든 시설의 목록을 조회합니다. 표시 순서에 따라 정렬되어 반환됩니다.',
  })
  @ApiParam({
    name: 'tourId',
    description: '투어 ID',
    type: String,
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: '투어 시설 목록을 성공적으로 조회했습니다.',
    type: [TourFacilityResponse],
    schema: {
      example: [
        {
          id: '999',
          tourId: '123',
          facilityId: '456',
          facilityTitle: 'LED 조명',
          facilityDescription: '에너지 효율적인 LED 조명 시스템',
          sceneId: '789',
          cameraPosX: 10.5,
          cameraPosY: 20.3,
          cameraPosZ: 15.8,
          isDefaultStart: true,
          displayOrder: 1,
          isActive: true,
          createdAt: '2024-01-15T09:30:00.000Z',
          updatedAt: '2024-01-15T09:30:00.000Z',
        },
        {
          id: '1000',
          tourId: '123',
          facilityId: '457',
          facilityTitle: '시스템 키친',
          facilityDescription: '빌트인 주방 가구',
          sceneId: '790',
          cameraPosX: -2.0,
          cameraPosY: 18.5,
          cameraPosZ: 12.0,
          isDefaultStart: false,
          displayOrder: 2,
          isActive: true,
          createdAt: '2024-01-15T09:45:00.000Z',
          updatedAt: '2024-01-15T09:45:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
    type: ErrorResponse,
    schema: {
      example: {
        statusCode: 404,
        message: '투어를 찾을 수 없습니다.',
        error: 'Not Found',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async getTourFacilities(
    @Param('tourId') tourId: string
  ): Promise<TourFacilityResponse[]> {
    const result = await this.tourFacilityService.getTourFacilities(tourId);

    return result.map((facility) => this.mapToResponse(facility));
  }

  @Get('cdn/:tourCdnId/facilities')
  @ApiOperation({
    summary: 'tourCdnId로 투어의 시설 목록 조회',
    description:
      'tourCdnId로 특정 투어에 배치된 모든 시설의 목록을 조회합니다. 표시 순서에 따라 정렬되어 반환됩니다.',
  })
  @ApiParam({
    name: 'tourCdnId',
    description: '투어 CDN ID',
    type: String,
    example: 'tour-123-sample',
  })
  @ApiResponse({
    status: 200,
    description: '투어 시설 목록을 성공적으로 조회했습니다.',
    type: [TourFacilityResponse],
    schema: {
      example: [
        {
          id: '999',
          tourId: '123',
          facilityId: '456',
          facilityTitle: 'LED 조명',
          facilityDescription: '에너지 효율적인 LED 조명 시스템',
          sceneId: '789',
          cameraPosX: 10.5,
          cameraPosY: 20.3,
          cameraPosZ: 15.8,
          isDefaultStart: true,
          displayOrder: 1,
          isActive: true,
          createdAt: '2024-01-15T09:30:00.000Z',
          updatedAt: '2024-01-15T09:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
    type: ErrorResponse,
    schema: {
      example: {
        statusCode: 404,
        message: '투어를 찾을 수 없습니다.',
        error: 'Not Found',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async getTourFacilitiesByCdnId(
    @Param('tourCdnId') tourCdnId: string
  ): Promise<TourFacilityResponse[]> {
    const result =
      await this.tourFacilityService.getTourFacilitiesByCdnId(tourCdnId);

    return result.map((facility) => this.mapToResponse(facility));
  }

  @Get(':tourId/facilities/:facilityId')
  @ApiOperation({
    summary: '투어 시설 상세 조회',
    description:
      '투어에 배치된 특정 시설의 상세 정보를 조회합니다. 카메라 위치, 기본 시작점 여부, 표시 순서 등의 상세 정보를 포함합니다.',
  })
  @ApiParam({
    name: 'tourId',
    description: '투어 ID',
    type: String,
    example: '123',
  })
  @ApiParam({
    name: 'facilityId',
    description: '투어 시설 ID',
    type: String,
    example: '999',
  })
  @ApiResponse({
    status: 200,
    description: '투어 시설 상세 정보를 성공적으로 조회했습니다.',
    type: TourFacilityResponse,
    schema: {
      example: {
        id: '999',
        tourId: '123',
        facilityId: '456',
        facilityTitle: 'LED 조명',
        facilityDescription: '에너지 효율적인 LED 조명 시스템',
        sceneId: '789',
        cameraPosX: 10.5,
        cameraPosY: 20.3,
        cameraPosZ: 15.8,
        isDefaultStart: true,
        displayOrder: 1,
        isActive: true,
        createdAt: '2024-01-15T09:30:00.000Z',
        updatedAt: '2024-01-15T10:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '투어 시설을 찾을 수 없습니다.',
    type: ErrorResponse,
    schema: {
      example: {
        statusCode: 404,
        message: '투어 시설을 찾을 수 없습니다.',
        error: 'Not Found',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async getTourFacilityById(
    @Param('tourId') tourId: string,
    @Param('facilityId') facilityId: string
  ): Promise<TourFacilityResponse> {
    const result = await this.tourFacilityService.getTourFacilityById(
      tourId,
      facilityId
    );

    return this.mapToResponse(result);
  }

  @Patch(':tourId/facilities/reorder')
  // @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '투어 시설 순서 변경',
    description: '투어에 배치된 시설들의 표시 순서를 변경합니다.',
  })
  @ApiParam({ name: 'tourId', description: '투어 ID', type: String })
  @ApiResponse({
    status: 204,
    description: '시설 순서가 성공적으로 변경되었습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '투어를 찾을 수 없습니다.' })
  async reorderTourFacilities(
    @Param('tourId') tourId: string,
    @Body() request: ReorderTourFacilitiesRequest
  ): Promise<void> {
    const reorderDto: ReorderTourFacilitiesCommand = {
      tourId: tourId,
      facilities: request.facilities.map((f) => ({
        id: f.id,
        displayOrder: f.displayOrder,
      })),
    };

    await this.tourFacilityService.reorderTourFacilities(reorderDto);
  }

  @Patch(':tourId/facilities/:facilityId/default')
  // @UseGuards(CsrfGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '기본 시작 위치 설정',
    description: '특정 시설을 투어의 기본 시작 위치로 설정합니다.',
  })
  @ApiParam({ name: 'tourId', description: '투어 ID', type: String })
  @ApiParam({ name: 'facilityId', description: '투어 시설 ID', type: String })
  @ApiResponse({
    status: 204,
    description: '기본 시작 위치가 성공적으로 설정되었습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '투어 시설을 찾을 수 없습니다.' })
  async setDefaultStart(
    @Param('tourId') tourId: string,
    @Param('facilityId') facilityId: string
  ): Promise<void> {
    await this.tourFacilityService.setDefaultStart(tourId, facilityId);
  }

  @Post('facilities/scene-import')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'LH CSV 기반 씬 ID 일괄 업데이트',
    description:
      'LH매타버스 설비 파일의 설비 포인트 데이터를 csv 파일로 Export 후 업로드하면 square_meters 기준으로 투어를 찾고 시설별 Scene ID를 일괄 업데이트합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'csv 파일',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'LH 포맷의 CSV 파일',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '씬 ID 업데이트 처리 결과',
    type: TourFacilitySceneImportResponse,
  })
  async importSceneIds(
    @UploadedFile() file: Express.Multer.File
  ): Promise<TourFacilitySceneImportResponse> {
    if (!file) {
      throw new BadRequestException('CSV 파일을 업로드해주세요.');
    }

    const result =
      await this.tourFacilityImportService.importSceneIdsFromCsv(file);
    return TourFacilitySceneImportResponse.fromResult(result);
  }

  /**
   * Application DTO를 Presentation Response로 매핑
   */
  private mapToResponse(dto: any): TourFacilityResponse {
    return {
      id: dto.id.toString(),
      tourId: dto.tourId.toString(),
      facilityId: dto.facilityId.toString(),
      facilityTitle: dto.facilityTitle,
      facilityDescription: dto.facilityDescription,
      sceneId: dto.sceneId.toString(),
      cameraPosX: dto.cameraPosX,
      cameraPosY: dto.cameraPosY,
      cameraPosZ: dto.cameraPosZ,
      isDefaultStart: dto.isDefaultStart,
      displayOrder: dto.displayOrder,
      isActive: dto.isActive,
      type: dto.type,
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }
}
