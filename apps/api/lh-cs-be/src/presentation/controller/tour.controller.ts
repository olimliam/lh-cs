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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTourCommand } from '../../application/dto/command/create-tour.command';
import { UpdateTourCommand } from '../../application/dto/command/update-tour.command';
import { TourService } from '../../application/service/tour.service';
import { CommonResponse } from '../../common/dto/common-response.dto';
import { TourErrorCode } from '@/common/exception/error/tour-error-code.enum';
import { ResponsePayload } from '@/common/dto/response-payload.dto';
import { TourResponse } from '../dto/response/tour.response';

@ApiTags('투어 관리')
@ApiBearerAuth()
@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '투어 생성',
    description: '새로운 투어를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '투어가 성공적으로 생성되었습니다.',
    type: CommonResponse<TourResponse>,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 투어 ID',
  })
  @HttpCode(HttpStatus.CREATED)
  async createTour(
    @Body() createDto: CreateTourCommand
  ): Promise<ResponsePayload<TourResponse>> {
    const tour = await this.tourService.createTour(createDto);

    return {
      data: tour,
      code: TourErrorCode.TOUR_CREATED,
    };
  }

  @Get()
  @ApiOperation({
    summary: '투어 목록 조회',
    description: '모든 투어 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'isActive',
    description: '활성화 상태 필터',
    type: 'boolean',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '투어 목록 조회 성공',
    type: CommonResponse<TourResponse[]>,
  })
  async getAllTours(
    @Query('isActive') isActive?: boolean
  ): Promise<ResponsePayload<TourResponse[]>> {
    const tours = await this.tourService.getAllTours(isActive);

    return {
      data: tours,
      code: TourErrorCode.TOUR_LIST_FETCHED,
    };
  }

  @Get('tourId/:tourId')
  @ApiOperation({
    summary: '투어 ID로 투어 조회',
    description: 'tourId로 투어를 조회합니다.',
  })
  @ApiParam({
    name: 'tourId',
    description: '투어 접근 ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '투어 조회 성공',
    type: CommonResponse<TourResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
  })
  async getTourByTourId(
    @Param('tourId') tourId: string
  ): Promise<ResponsePayload<TourResponse>> {
    const tour = await this.tourService.getTourByTourId(tourId);

    return {
      data: tour,
      code: TourErrorCode.TOUR_FETCHED,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '투어 상세 조회',
    description: 'ID로 투어 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '투어 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '투어 상세 조회 성공',
    type: CommonResponse<TourResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
  })
  async getTourById(
    @Param('id') id: string
  ): Promise<ResponsePayload<TourResponse>> {
    const tour = await this.tourService.getTourById(id);

    return {
      data: tour,
      code: TourErrorCode.TOUR_FETCHED,
    };
  }

  @Put(':id')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '투어 수정',
    description: '투어 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '투어 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '투어가 성공적으로 수정되었습니다.',
    type: CommonResponse<TourResponse>,
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 투어 ID',
  })
  @HttpCode(HttpStatus.OK)
  async updateTour(
    @Param('id') id: string,
    @Body() updateDto: UpdateTourCommand
  ): Promise<ResponsePayload<TourResponse>> {
    const tour = await this.tourService.updateTour(id, updateDto);

    return {
      data: tour,
      code: TourErrorCode.TOUR_UPDATED_SUCCESS,
    };
  }

  @Delete(':id')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '투어 삭제',
    description: '투어를 삭제합니다 (소프트 삭제).',
  })
  @ApiParam({
    name: 'id',
    description: '투어 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '투어가 성공적으로 삭제되었습니다.',
    type: CommonResponse<null>,
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
  })
  @HttpCode(HttpStatus.OK)
  async deleteTour(@Param('id') id: string): Promise<ResponsePayload<null>> {
    await this.tourService.deleteTour(id);

    return {
      data: null,
      code: TourErrorCode.TOUR_DELETED_SUCCESS,
    };
  }

  @Delete(':id/hard')
  // @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: '투어 완전 삭제',
    description: '투어를 완전히 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '투어 ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '투어가 완전히 삭제되었습니다.',
    type: CommonResponse<null>,
  })
  @ApiResponse({
    status: 404,
    description: '투어를 찾을 수 없습니다.',
  })
  @HttpCode(HttpStatus.OK)
  async hardDeleteTour(
    @Param('id') id: string
  ): Promise<ResponsePayload<null>> {
    await this.tourService.hardDeleteTour(id);

    return {
      data: null,
      code: TourErrorCode.TOUR_HARD_DELETED_SUCCESS,
    };
  }
}
