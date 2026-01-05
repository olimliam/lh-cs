import { CreateNotificationCommand } from '@/application/dto/command/create-notification.command';
import { UpdateNotificationCommand } from '@/application/dto/command/update-notification.command';
import { NotificationService } from '@/application/service/notification.service';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { Roles } from '@/common/decorator/roles.decorator';
import { CommonResponse } from '@/common/dto/common-response.dto';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import {
  ATTACHMENT_MAX_COUNT,
  ATTACHMENT_POLICY_DEFAULT,
} from '@/common/utils/attachment.util';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { GetNotificationsRequest } from '@/presentation/dto/request/get-notifications.request';
import {
  NotificationResponse,
  PaginatedNotificationResponse,
} from '@/presentation/dto/response/notification.response';
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

@ApiTags('공지사항 관리')
@ApiBearerAuth()
@ApiExtraModels(
  CommonResponse,
  PaginatedNotificationResponse,
  NotificationResponse
)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '공지사항 목록 조회' })
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
    description: '공지사항 목록 조회 성공',
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
                { $ref: getSchemaPath(PaginatedNotificationResponse) },
                {
                  example: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    data: [
                      {
                        id: '1',
                        title: '상담 시스템 점검 안내',
                        content:
                          '2024년 12월 10일(화) 02:00~05:00 동안 시스템 점검이 예정되어 있습니다.',
                        attachments: [
                          {
                            attachmentId: '101',
                            fileName: 'maintenance.pdf',
                            fileUrl:
                              'https://cdn.example.com/notifications/maintenance.pdf',
                            fileKey: 'notifications/maintenance.pdf',
                            mimeType: 'application/pdf',
                            fileSize: '102400',
                            order: 1,
                          },
                        ],
                        createdAt: '2024-12-01T09:00:00.000Z',
                        updatedAt: '2024-12-01T09:00:00.000Z',
                        isPublic: true,
                        createdBy: 'admin',
                        updatedBy: 'admin',
                      },
                      {
                        id: '2',
                        title: '신규 상담 안내 자료 배포',
                        content:
                          '상담 운영 가이드를 갱신했습니다. 첨부 파일을 다운로드하여 확인해주세요.',
                        attachments: [],
                        createdAt: '2024-11-21T06:30:00.000Z',
                        updatedAt: '2024-11-25T02:10:00.000Z',
                        isPublic: true,
                        createdBy: 'manager01',
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
  async getNotifications(
    @Query() query: GetNotificationsRequest
  ): Promise<CommonResponse<PaginatedNotificationResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await this.notificationService.getNotifications({
      page,
      limit,
      orderBy: (query.orderBy ?? 'createdAt') as 'createdAt' | 'updatedAt',
      orderDirection: (query.orderDirection ?? 'DESC') as 'ASC' | 'DESC',
      isPublic: query.isPublic,
    });

    return CommonResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '공지사항 상세 조회' })
  @ApiParam({
    name: 'id',
    description: '공지 ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '공지사항 상세 조회 성공',
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
                { $ref: getSchemaPath(NotificationResponse) },
                {
                  example: {
                    id: '1',
                    title: '상담 시스템 점검 안내',
                    content:
                      '2024년 12월 10일(화) 02:00~05:00 동안 시스템 점검이 예정되어 있습니다.',
                    attachments: [
                      {
                        attachmentId: '101',
                        fileName: 'maintenance.pdf',
                        fileUrl:
                          'https://cdn.example.com/notifications/maintenance.pdf',
                        fileKey: 'notifications/maintenance.pdf',
                        mimeType: 'application/pdf',
                        fileSize: '102400',
                        order: 1,
                      },
                    ],
                    createdAt: '2024-12-01T09:00:00.000Z',
                    updatedAt: '2024-12-01T09:00:00.000Z',
                    isPublic: true,
                    createdBy: 'admin',
                    updatedBy: 'admin',
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
    description: '존재하지 않는 공지',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'NOTIFICATION_NOT_FOUND' },
            message: { example: '공지사항을 찾을 수 없습니다.' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async getNotification(
    @Param('id') id: string
  ): Promise<CommonResponse<NotificationResponse>> {
    const notification = await this.notificationService.getNotification(id);
    return CommonResponse.success(notification);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('attachments', ATTACHMENT_MAX_COUNT))
  @ApiOperation({ summary: '공지사항 생성' })
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
          items: { type: 'string', example: '101' },
          description: '본문에서 사용한 인라인 이미지 ID 배열',
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
    description: '공지사항 생성 성공',
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
                { $ref: getSchemaPath(NotificationResponse) },
                {
                  example: {
                    id: '3',
                    title: '12월 상담 스케줄 안내',
                    content:
                      '12월 상담 스케줄이 업데이트되었습니다. 첨부 자료를 참고해 주세요.',
                    attachments: [
                      {
                        attachmentId: '103',
                        fileName: 'schedule.zip',
                        fileUrl:
                          'https://cdn.example.com/notifications/schedule.zip',
                        fileKey: 'notifications/schedule.zip',
                        mimeType: 'application/zip',
                        fileSize: '204800',
                        order: 1,
                      },
                    ],
                    createdAt: '2024-12-04T00:00:00.000Z',
                    updatedAt: '2024-12-04T00:00:00.000Z',
                    isPublic: true,
                    createdBy: 'support-admin',
                    updatedBy: 'support-admin',
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
            code: { example: 'NOTIFICATION_INVALID_ATTACHMENT' },
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
  async createNotification(
    @Body() command: CreateNotificationCommand,
    @UploadedFiles() attachments: Express.Multer.File[],
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<NotificationResponse>> {
    if (!currentUser?.id) {
      throw new BadRequestException('작성자 정보를 확인할 수 없습니다.');
    }

    if ((!attachments || attachments.length === 0) && command.attachmentNames) {
      throw new BadRequestException(
        '첨부 파일이 없는데 이름만 전달되었습니다.'
      );
    }

    const notification = await this.notificationService.createNotification(
      command,
      attachments,
      currentUser.id
    );

    return CommonResponse.success(notification);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('attachments', ATTACHMENT_MAX_COUNT))
  @ApiOperation({ summary: '공지사항 수정' })
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
            '본문에서 사용 중인 인라인 이미지 ID 목록(지정하지 않으면 기존 유지)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '공지사항 수정 성공',
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
                { $ref: getSchemaPath(NotificationResponse) },
                {
                  example: {
                    id: '3',
                    title: '12월 상담 스케줄 안내 (수정)',
                    content:
                      '12월 상담 스케줄이 변경되었습니다. 최신 첨부 자료를 확인해주세요.',
                    attachments: [],
                    createdAt: '2024-12-04T00:00:00.000Z',
                    updatedAt: '2024-12-05T08:30:00.000Z',
                    isPublic: true,
                    createdBy: 'support-admin',
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
            code: { example: 'NOTIFICATION_INVALID_ATTACHMENT' },
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
    description: '존재하지 않는 공지',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CommonResponse) },
        {
          properties: {
            success: { example: false },
            code: { example: 'NOTIFICATION_NOT_FOUND' },
            message: { example: '공지사항을 찾을 수 없습니다.' },
            data: { type: 'null', example: null },
          },
          required: ['success', 'code', 'message', 'data'],
        },
      ],
    },
  })
  async updateNotification(
    @Param('id') id: string,
    @Body() command: UpdateNotificationCommand,
    @UploadedFiles() attachments: Express.Multer.File[],
    @CurrentUser() currentUser: any
  ): Promise<CommonResponse<NotificationResponse>> {
    if (!currentUser?.id) {
      throw new BadRequestException('작성자 정보를 확인할 수 없습니다.');
    }

    if ((!attachments || attachments.length === 0) && command.attachmentNames) {
      throw new BadRequestException(
        '첨부 파일이 없는데 이름만 전달되었습니다.'
      );
    }

    const notification = await this.notificationService.updateNotification(
      id,
      command,
      attachments,
      currentUser.id
    );

    return CommonResponse.success(notification);
  }
}
