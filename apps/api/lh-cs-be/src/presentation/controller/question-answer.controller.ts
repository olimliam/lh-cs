import { CreateQuestionAnswerCommand } from '@/application/dto/command/create-question-answer.command';
import { UpdateQuestionAnswerCommand } from '@/application/dto/command/update-question-answer.command';
import { QuestionAnswerService } from '@/application/service/question-answer.service';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { Roles } from '@/common/decorator/roles.decorator';
import { CommonResponse } from '@/common/dto/common-response.dto';
import {} from '@/common/guard/csrf.guard';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import {
  ATTACHMENT_MAX_COUNT,
  ATTACHMENT_POLICY_DEFAULT,
} from '@/common/utils/attachment.util';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { GetQuestionAnswersRequest } from '@/presentation/dto/request/get-question-answers.request';
import {
  PaginatedQuestionAnswerResponse,
  QuestionAnswerResponse,
} from '@/presentation/dto/response/question-answer.response';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

const ATTACHMENT_MESSAGES = ATTACHMENT_POLICY_DEFAULT;

@ApiTags('Q&A 관리')
@ApiBearerAuth()
@ApiExtraModels(
  CommonResponse,
  PaginatedQuestionAnswerResponse,
  QuestionAnswerResponse
)
@Controller('question-answers')
export class QuestionAnswerController {
  constructor(private readonly questionAnswerService: QuestionAnswerService) {}

  @Get()
  @ApiOperation({ summary: 'Q&A 목록 조회' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지 크기 (기본값 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt', 'updatedAt'],
    description: '정렬 기준 컬럼',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['ASC', 'DESC'],
    description: '정렬 방향',
  })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    type: Boolean,
    description: '공개 여부 필터 (미지정 시 전체 조회)',
  })
  @ApiResponse({
    status: 200,
    description: 'Q&A 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: true },
            code: { example: 'OK' },
            message: { example: '성공' },
            data: {
              allOf: [
                { $ref: getSchemaPath(PaginatedQuestionAnswerResponse) },
                {
                  example: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    data: [
                      {
                        id: '11',
                        title: '상담 예약 절차가 궁금해요',
                        content:
                          '상담실 생성 메뉴에서 예약 신청 후 승인 알림을 확인하시면 됩니다.',
                        attachments: [],
                        createdAt: '2024-11-30T03:00:00.000Z',
                        updatedAt: '2024-11-30T03:00:00.000Z',
                        isPublic: true,
                        createdBy: 'consultant01',
                        updatedBy: 'consultant01',
                      },
                      {
                        id: '12',
                        title: '상담 자료는 어디에서 다운받나요?',
                        content:
                          '관리자 포털 Q&A 게시판에서 첨부 파일을 확인해주세요.',
                        attachments: [
                          {
                            attachmentId: '201',
                            fileName: 'reference.zip',
                            fileUrl:
                              'https://cdn.example.com/qna/reference.zip',
                            fileKey: 'qna/reference.zip',
                            mimeType: 'application/zip',
                            fileSize: '307200',
                            order: 1,
                          },
                        ],
                        createdAt: '2024-11-21T06:30:00.000Z',
                        updatedAt: '2024-11-25T02:10:00.000Z',
                        isPublic: false,
                        createdBy: 'support01',
                        updatedBy: 'content-admin',
                      },
                    ],
                  },
                },
              ],
            },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 조회 조건',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'BAD_REQUEST' },
            message: {
              example:
                'orderBy must be one of the following values: createdAt, updatedAt',
            },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Unauthorized' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async getQuestionAnswers(
    @Query() query: GetQuestionAnswersRequest
  ): Promise<CommonResponse<PaginatedQuestionAnswerResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await this.questionAnswerService.getQuestionAnswers({
      page,
      limit,
      orderBy: (query.orderBy ?? 'createdAt') as 'createdAt' | 'updatedAt',
      orderDirection: (query.orderDirection ?? 'DESC') as 'ASC' | 'DESC',
      isPublic: query.isPublic,
    });

    return CommonResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Q&A 상세 조회' })
  @ApiParam({
    name: 'id',
    description: 'Q&A ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Q&A 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: true },
            code: { example: 'OK' },
            message: { example: '성공' },
            data: {
              allOf: [
                { $ref: getSchemaPath(QuestionAnswerResponse) },
                {
                  example: {
                    id: '11',
                    title: '상담 예약 절차가 궁금해요',
                    content:
                      '상담실 생성 메뉴에서 예약 신청 후 승인 알림을 확인하시면 됩니다.',
                    attachments: [],
                    createdAt: '2024-11-30T03:00:00.000Z',
                    updatedAt: '2024-11-30T03:00:00.000Z',
                    isPublic: true,
                    createdBy: 'consultant01',
                    updatedBy: 'consultant01',
                  },
                },
              ],
            },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Unauthorized' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 Q&A',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Q&A를 찾을 수 없습니다.' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async getQuestionAnswer(
    @Param('id') id: string
  ): Promise<CommonResponse<QuestionAnswerResponse>> {
    const data = await this.questionAnswerService.getQuestionAnswer(id);
    return CommonResponse.success(data);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('attachments', ATTACHMENT_MAX_COUNT))
  @ApiOperation({ summary: 'Q&A 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 200 },
        content: { type: 'string' },
        isPublic: { type: 'boolean', default: true },
        attachmentNames: {
          type: 'array',
          description: '첨부 파일별 사용자 지정 이름 목록(attachmentNames[])',
          items: { type: 'string', maxLength: 255 },
        },
        contentImageRefs: {
          type: 'array',
          items: { type: 'string', example: '201' },
          description: '본문 인라인 이미지 ID 목록',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: `${ATTACHMENT_MESSAGES.allowedAttachmentDescription} (최대 ${ATTACHMENT_MAX_COUNT}개)`,
        },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Q&A 생성 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: true },
            code: { example: 'OK' },
            message: { example: '성공' },
            data: {
              allOf: [
                { $ref: getSchemaPath(QuestionAnswerResponse) },
                {
                  example: {
                    id: '13',
                    title: '상담 예약 승인 알림은 언제 오나요?',
                    content:
                      '관리자가 예약 요청을 확인하면 즉시 알림으로 안내드립니다.',
                    attachments: [
                      {
                        attachmentId: '202',
                        fileName: '안내문.pdf',
                        fileUrl: 'https://cdn.example.com/qna/guide.pdf',
                        fileKey: 'qna/guide.pdf',
                        mimeType: 'application/pdf',
                        fileSize: '102400',
                        order: 1,
                      },
                    ],
                    createdAt: '2024-12-05T08:30:00.000Z',
                    updatedAt: '2024-12-05T08:30:00.000Z',
                    isPublic: true,
                    createdBy: 'consultant02',
                    updatedBy: 'consultant02',
                  },
                },
              ],
            },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 첨부 파일 또는 요청 본문',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'BAD_REQUEST' },
            message: { example: ATTACHMENT_MESSAGES.allowedAttachmentMessage },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Unauthorized' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'CSRF 토큰 검증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'CSRF_TOKEN_INVALID' },
            message: {
              example:
                'CSRF token이 일치하지 않습니다. 세션이 무효화되었습니다.',
            },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createQuestionAnswer(
    @Body() command: CreateQuestionAnswerCommand,
    @UploadedFiles() attachments: Express.Multer.File[],
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<QuestionAnswerResponse>> {
    if (!currentUser?.id) {
      throw new BadRequestException('작성자 정보를 확인할 수 없습니다.');
    }

    if ((!attachments || attachments.length === 0) && command.attachmentNames) {
      throw new BadRequestException(
        '첨부 파일이 없는데 이름만 전달되었습니다.'
      );
    }

    const data = await this.questionAnswerService.createQuestionAnswer(
      command,
      attachments,
      currentUser.id
    );

    return CommonResponse.success(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('attachments', ATTACHMENT_MAX_COUNT))
  @ApiOperation({ summary: 'Q&A 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 200, nullable: true },
        content: { type: 'string', nullable: true },
        removeExistingFiles: {
          type: 'boolean',
          default: false,
          description: 'true로 설정 시 기존 첨부 파일 전체 삭제',
        },
        attachmentNames: {
          type: 'array',
          description: '새 첨부 파일별 사용자 지정 이름 목록',
          items: { type: 'string', maxLength: 255 },
        },
        attachmentIdsToRemove: {
          type: 'array',
          description: '삭제할 첨부 ID 배열(attachmentIdsToRemove[])',
          items: { type: 'string' },
        },
        isPublic: {
          type: 'boolean',
          description: '공개 여부 (미지정 시 기존 값 유지)',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: `${ATTACHMENT_MESSAGES.allowedAttachmentDescription} (최대 ${ATTACHMENT_MAX_COUNT}개)`,
        },
        contentImageRefs: {
          type: 'array',
          items: { type: 'string' },
          description:
            '본문 인라인 이미지 ID 목록(지정하지 않으면 기존 상태 유지)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Q&A 수정 성공',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: true },
            code: { example: 'OK' },
            message: { example: '성공' },
            data: {
              allOf: [
                { $ref: getSchemaPath(QuestionAnswerResponse) },
                {
                  example: {
                    id: '13',
                    title: '상담 예약 승인 알림은 언제 오나요? (수정)',
                    content:
                      '승인 결과는 관리자 검토 후 영업일 기준 1일 이내에 안내됩니다.',
                    attachments: [
                      {
                        attachmentId: '203',
                        fileName: 'approval-guide.zip',
                        fileUrl:
                          'https://cdn.example.com/qna/approval-guide.zip',
                        fileKey: 'qna/approval-guide.zip',
                        mimeType: 'application/zip',
                        fileSize: '512000',
                        order: 1,
                      },
                    ],
                    createdAt: '2024-12-05T08:30:00.000Z',
                    updatedAt: '2024-12-06T02:10:00.000Z',
                    isPublic: true,
                    createdBy: 'consultant02',
                    updatedBy: 'content-manager',
                  },
                },
              ],
            },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 첨부 파일 또는 요청 본문',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'BAD_REQUEST' },
            message: { example: ATTACHMENT_MESSAGES.allowedAttachmentMessage },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Unauthorized' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'CSRF 토큰 검증 실패',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'CSRF_TOKEN_INVALID' },
            message: {
              example:
                'CSRF token이 일치하지 않습니다. 세션이 무효화되었습니다.',
            },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 Q&A',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'INTERNAL_SERVER_ERROR' },
            message: { example: 'Q&A를 찾을 수 없습니다.' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async updateQuestionAnswer(
    @Param('id') id: string,
    @Body() command: UpdateQuestionAnswerCommand,
    @UploadedFiles() attachments: Express.Multer.File[],
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<QuestionAnswerResponse>> {
    if (!currentUser?.id) {
      throw new BadRequestException('작성자 정보를 확인할 수 없습니다.');
    }

    if ((!attachments || attachments.length === 0) && command.attachmentNames) {
      throw new BadRequestException(
        '첨부 파일이 없는데 이름만 전달되었습니다.'
      );
    }

    const data = await this.questionAnswerService.updateQuestionAnswer(
      id,
      command,
      attachments,
      currentUser.id
    );

    return CommonResponse.success(data);
  }
}
