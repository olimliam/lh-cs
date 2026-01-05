import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import type { Express } from 'express';
import { EntityManager } from 'typeorm';
import {
  ATTACHMENT_POLICY_DEFAULT,
  buildAttachmentMessages,
  extractAttachmentExtension,
  sanitizeAttachmentName,
} from '@/common/utils/attachment.util';
import {
  S3ClientService,
  S3UploadResult,
  UploadFile,
} from '@/common/s3/s3-client.service';
import { UploadContentImageCommand } from '@/application/dto/command/upload-content-image.command';
import { ContentImageRepository } from '@/infrastructure/repository/content-image.repository';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { CustomException } from '@/common/exception/custom.exception';
import { ContentImageErrorCode } from '@/common/exception/error';
import { ContentImageResponse } from '@/presentation/dto/response/content-image.response';
import { attachmentConfig } from '@/config/attachment.config';

const INLINE_IMAGE_ALLOWED_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
]);

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

const DEFAULT_INLINE_IMAGE_FILENAME = 'inline-image';

@Injectable()
export class ContentImageService {
  private readonly attachmentMaxSizeBytes: number;
  private readonly attachmentMessages: ReturnType<
    typeof buildAttachmentMessages
  >;

  constructor(
    private readonly logger: Logger,
    private readonly contentImageRepository: ContentImageRepository,
    private readonly s3ClientService: S3ClientService,
    private readonly configService: ConfigService
  ) {
    const attachmentConf =
      this.configService.get<ConfigType<typeof attachmentConfig>>(
        'attachment'
      ) ?? ATTACHMENT_POLICY_DEFAULT;

    this.attachmentMaxSizeBytes =
      (attachmentConf as any).maxSizeBytes ??
      ATTACHMENT_POLICY_DEFAULT.maxSizeBytes;
    this.attachmentMessages = buildAttachmentMessages(
      this.attachmentMaxSizeBytes
    );
  }

  async uploadInlineImage(
    command: UploadContentImageCommand,
    file: Express.Multer.File | undefined,
    actorId: string
  ): Promise<ContentImageResponse> {
    if (!file) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_INVALID_PAYLOAD,
        HttpStatus.BAD_REQUEST,
        '업로드할 이미지 파일을 선택해주세요.'
      );
    }

    const mimeType = file.mimetype?.toLowerCase() ?? null;

    this.ensureMimeType(mimeType);
    this.ensureFileSize(file.size ?? 0);

    const finalMimeType = mimeType!;
    const preferredName = command.fileName ?? file.originalname;
    const fileName = this.buildFileName(preferredName, finalMimeType);
    const folder = this.buildFolder(command.contentType, command.contentId);
    const uploadResult = await this.uploadToS3({
      file: {
        buffer: file.buffer,
        originalname: fileName,
        mimetype: finalMimeType,
      },
      folder,
      preferredFilename: fileName,
    });

    const entity = await this.contentImageRepository.createImage({
      contentType: command.contentType,
      contentId: command.contentId ?? null,
      s3Key: uploadResult.key,
      url: uploadResult.url,
      fileName,
      contentTypeHeader: finalMimeType,
      uploadedBy: actorId,
      isUsed: false,
    });

    return ContentImageResponse.fromEntity(entity);
  }

  async syncContentImageUsage(params: {
    contentType: ContentOwnerType;
    contentId: string;
    imageIds: readonly string[];
    actorId: string;
    manager?: EntityManager;
  }): Promise<void> {
    const normalizedIds = Array.from(
      new Set(
        (params.imageIds ?? [])
          .filter((id) => id !== undefined && id !== null)
          .map((id) => `${id}`)
      )
    );

    if (normalizedIds.length === 0) {
      await this.contentImageRepository.unlinkImagesForContent(
        {
          contentType: params.contentType,
          contentId: params.contentId,
        },
        params.manager
      );
      return;
    }

    const images = await this.contentImageRepository.findByIds(
      normalizedIds,
      params.manager
    );

    if (images.length !== normalizedIds.length) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_NOT_FOUND,
        HttpStatus.BAD_REQUEST
      );
    }

    const mismatched = images.find(
      (image) => image.contentType !== params.contentType
    );

    if (mismatched) {
      throw new CustomException(
        ContentImageErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        '콘텐츠 유형과 이미지 유형이 일치하지 않습니다.'
      );
    }

    const forbidden = images.find(
      (image) => image.contentId && image.contentId !== params.contentId
    );

    if (forbidden) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_FORBIDDEN,
        HttpStatus.FORBIDDEN
      );
    }

    await this.contentImageRepository.linkImagesToContent(
      {
        contentType: params.contentType,
        contentId: params.contentId,
        imageIds: normalizedIds,
      },
      params.manager
    );

    await this.contentImageRepository.unlinkImagesForContent(
      {
        contentType: params.contentType,
        contentId: params.contentId,
        excludeImageIds: normalizedIds,
      },
      params.manager
    );
  }

  private ensureMimeType(mimeType: string | null): asserts mimeType is string {
    if (!mimeType) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_INVALID_MIME_TYPE,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!INLINE_IMAGE_ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_INVALID_MIME_TYPE,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private ensureFileSize(fileSize: number): void {
    if (fileSize > this.attachmentMaxSizeBytes) {
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_MAX_SIZE_EXCEEDED,
        HttpStatus.BAD_REQUEST,
        this.attachmentMessages.attachmentSizeMessage
      );
    }
  }

  private buildFileName(
    provided: string | undefined,
    mimeType: string
  ): string {
    const sanitized =
      sanitizeAttachmentName(provided, DEFAULT_INLINE_IMAGE_FILENAME) ||
      DEFAULT_INLINE_IMAGE_FILENAME;
    const normalized = sanitized.toLowerCase();
    const existingExt = extractAttachmentExtension(normalized);
    const extFromMime = MIME_EXTENSION_MAP[mimeType];

    if (existingExt) {
      return normalized;
    }

    if (extFromMime) {
      return `${normalized}.${extFromMime}`;
    }

    return `${normalized}.png`;
  }

  private buildFolder(
    contentType: ContentOwnerType,
    contentId?: string
  ): string {
    const base = contentType.toLowerCase().replace(/_/g, '-');
    if (!contentId) {
      return base;
    }
    return `${base}/${contentId}`;
  }

  private async uploadToS3(params: {
    file: UploadFile;
    folder: string;
    preferredFilename: string;
  }): Promise<S3UploadResult> {
    try {
      return await this.s3ClientService.uploadImage(
        params.file,
        params.folder,
        'content-images',
        params.preferredFilename
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload inline image to S3: ${
          error instanceof Error ? error.message : 'unknown error'
        }`
      );
      throw new CustomException(
        ContentImageErrorCode.CONTENT_IMAGE_UPLOAD_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
