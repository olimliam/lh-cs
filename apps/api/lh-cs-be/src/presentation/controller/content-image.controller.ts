import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Express } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { CommonResponse } from '@/common/dto/common-response.dto';
import { ContentImageService } from '@/application/service/content-image.service';
import { UploadContentImageCommand } from '@/application/dto/command/upload-content-image.command';
import { ContentImageResponse } from '@/presentation/dto/response/content-image.response';

const INLINE_IMAGE_UPLOAD_OPTIONS: MulterOptions = {};

@ApiTags('콘텐츠 인라인 이미지')
@ApiBearerAuth()
@ApiExtraModels(CommonResponse, ContentImageResponse)
@UseGuards(JwtAuthGuard)
@Controller('content-images')
export class ContentImageController {
  constructor(private readonly contentImageService: ContentImageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', INLINE_IMAGE_UPLOAD_OPTIONS))
  @ApiOperation({
    summary: '콘텐츠 인라인 이미지 업로드',
    description:
      '에디터에서 첨부한 이미지를 S3에 업로드하고 URL/ID를 반환합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contentType: {
          type: 'string',
          enum: ['NOTIFICATION', 'QUESTION_ANSWER'],
        },
        contentId: {
          type: 'string',
          nullable: true,
          description: `연결할 콘텐츠 ID : 미입력 시 임시 이미지가 되며, 게시판 등록시 매핑됩니다. <br/>
            만약 이미지 생성시 입력하면 게시판 등록시 중복 사용을 방지하기 위해 검증 용도로 사용됩니다.`,
        },
        fileName: {
          type: 'string',
          nullable: true,
          description: '저장할 파일명을 명시적으로 지정',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일',
        },
      },
      required: ['contentType', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '업로드 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: true },
            code: { example: 'OK' },
            message: { example: '성공' },
            data: { $ref: getSchemaPath(ContentImageResponse) },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 이미지 파일 혹은 MIME 타입',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'CONTENT_IMAGE_INVALID_PAYLOAD' },
            message: { example: '유효한 이미지 파일을 업로드해주세요.' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async uploadInlineImage(
    @Body() command: UploadContentImageCommand,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<ContentImageResponse>> {
    if (!currentUser?.id) {
      throw new BadRequestException('업로더 정보를 확인할 수 없습니다.');
    }

    const result = await this.contentImageService.uploadInlineImage(
      command,
      file,
      String(currentUser.id)
    );

    return CommonResponse.success(result);
  }
}
