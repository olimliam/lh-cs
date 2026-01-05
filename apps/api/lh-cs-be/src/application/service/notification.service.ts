import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import type { Express } from 'express';
import { NotificationRepository } from '@/infrastructure/repository/notification.repository';
import { ContentAttachmentRepository } from '@/infrastructure/repository/content-attachment.repository';
import {
  S3ClientService,
  S3UploadResult,
  UploadFile,
} from '@/common/s3/s3-client.service';
import { CreateNotificationCommand } from '../dto/command/create-notification.command';
import { UpdateNotificationCommand } from '../dto/command/update-notification.command';
import { NotificationPaginationOptions } from '@/infrastructure/repository/notification.repository';
import {
  NotificationResponse,
  PaginatedNotificationResponse,
} from '@/presentation/dto/response/notification.response';
import { CustomException } from '@/common/exception/custom.exception';
import { NotificationErrorCode } from '@/common/exception/error';
import { DataSource, EntityManager } from 'typeorm';
import {
  ATTACHMENT_MAX_COUNT,
  ATTACHMENT_MAX_COUNT_MESSAGE,
  ATTACHMENT_POLICY_DEFAULT,
  buildAttachmentMessages,
  ensureAttachmentExtension,
  isAllowedAttachment,
  sanitizeAttachmentName,
} from '@/common/utils/attachment.util';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { ContentImageService } from './content-image.service';
import { attachmentConfig } from '@/config/attachment.config';

type UploadedAttachment = {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  mimeType?: string;
  fileSize?: number;
};
import { ContentAttachmentEntity } from '@/infrastructure/repository/entity/content-attachment.entity';

@Injectable()
export class NotificationService {
  private readonly attachmentMaxSizeBytes: number;
  private readonly attachmentMessages: ReturnType<typeof buildAttachmentMessages>;

  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly notificationRepository: NotificationRepository,
    private readonly contentAttachmentRepository: ContentAttachmentRepository,
    private readonly s3ClientService: S3ClientService,
    private readonly contentImageService: ContentImageService,
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

  async createNotification(
    command: CreateNotificationCommand,
    files: Express.Multer.File[] | undefined,
    actorId: string
  ): Promise<NotificationResponse> {
    const uploadTargets = files ?? [];
    this.ensureAttachmentLimit([], {
      removeExistingFiles: false,
      attachmentIdsToRemove: [],
      newFilesCount: uploadTargets.length,
      errorCode: NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT,
    });

    const uploadedAttachments = await this.prepareAttachmentUploads(
      uploadTargets,
      command.attachmentNames
    );

    const entity = await this.dataSource.transaction(async (manager) => {
      const created = await this.notificationRepository.create(
        {
          title: command.title,
          content: command.content,
          fileUrl: uploadedAttachments[0]?.fileUrl ?? null,
          isPublic: command.isPublic ?? true,
          createdBy: actorId,
          updatedBy: actorId,
        },
        manager
      );

      if (uploadedAttachments.length) {
        await this.contentAttachmentRepository.createAttachments(
          uploadedAttachments.map((attachment, index) => ({
            ownerType: ContentOwnerType.NOTIFICATION,
            ownerId: created.id,
            attachmentIndex: index + 1,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileKey: attachment.fileKey,
            mimeType: attachment.mimeType,
            fileSize: attachment.fileSize,
            createdBy: actorId,
          })),
          manager
        );
      }

      if (command.contentImageRefs !== undefined) {
        await this.contentImageService.syncContentImageUsage(
          {
            contentType: ContentOwnerType.NOTIFICATION,
            contentId: created.id,
            imageIds: command.contentImageRefs ?? [],
            actorId,
            manager,
          }
        );
      }

      return (
        (await this.notificationRepository.findById(created.id, manager)) ??
        created
      );
    });

    return NotificationResponse.fromEntity(entity);
  }

  async getNotification(id: string): Promise<NotificationResponse> {
    const entity = await this.notificationRepository.findById(id);

    if (!entity) {
      throw new CustomException(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return NotificationResponse.fromEntity(entity);
  }

  async getNotifications(
    options: NotificationPaginationOptions
  ): Promise<PaginatedNotificationResponse> {
    const { data, total } = await this.notificationRepository.findPaginated({
      ...options,
    });

    return PaginatedNotificationResponse.from(
      data,
      total,
      options.page,
      options.limit
    );
  }

  async updateNotification(
    id: string,
    command: UpdateNotificationCommand,
    files: Express.Multer.File[] | undefined,
    actorId: string
  ): Promise<NotificationResponse> {
    const existing = await this.notificationRepository.findById(id);

    if (!existing) {
      throw new CustomException(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const sanitizedTitle = command.title === '' ? undefined : command.title;
    const sanitizedContent =
      command.content === '' ? undefined : command.content;
    const uploadTargets = files ?? [];
    this.ensureAttachmentLimit(existing.contentAttachments ?? [], {
      removeExistingFiles: command.removeExistingFiles,
      attachmentIdsToRemove: command.attachmentIdsToRemove,
      newFilesCount: uploadTargets.length,
      errorCode: NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT,
    });
    const uploadedAttachments = await this.prepareAttachmentUploads(
      uploadTargets,
      command.attachmentNames
    );

    const updated = await this.dataSource.transaction(async (manager) => {
      const existing = await this.notificationRepository.findById(id, manager);

      if (!existing) {
        return null;
      }

      if (command.removeExistingFiles) {
        await this.removeAllAttachments(
          ContentOwnerType.NOTIFICATION,
          id,
          manager
        );
      } else if (command.attachmentIdsToRemove?.length) {
        await this.removeAttachmentsByIds(
          ContentOwnerType.NOTIFICATION,
          id,
          command.attachmentIdsToRemove,
          manager
        );
      }

      if (uploadedAttachments.length) {
        const existingAttachments =
          await this.contentAttachmentRepository.findAllByOwner(
            ContentOwnerType.NOTIFICATION,
            id,
            manager
          );
        const nextIndex = existingAttachments.length + 1;
        await this.contentAttachmentRepository.createAttachments(
          uploadedAttachments.map((attachment, index) => ({
            ownerType: ContentOwnerType.NOTIFICATION,
            ownerId: id,
            attachmentIndex: nextIndex + index,
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileKey: attachment.fileKey,
            mimeType: attachment.mimeType,
            fileSize: attachment.fileSize,
            createdBy: actorId,
          })),
          manager
        );
      }

      const finalAttachments =
        await this.contentAttachmentRepository.findAllByOwner(
          ContentOwnerType.NOTIFICATION,
          id,
          manager
        );

      const updatePayload: Parameters<NotificationRepository['update']>[1] = {
        title: sanitizedTitle,
        content: sanitizedContent,
        isPublic: command.isPublic,
        updatedBy: actorId,
      };

      const attachmentsMutated =
        !!command.removeExistingFiles ||
        (command.attachmentIdsToRemove?.length ?? 0) > 0 ||
        uploadedAttachments.length > 0;

      if (attachmentsMutated) {
        updatePayload.fileUrl = finalAttachments[0]?.fileUrl ?? null;
      }

      const updatedEntity = await this.notificationRepository.update(
        id,
        updatePayload,
        manager
      );

      if (command.contentImageRefs !== undefined) {
        await this.contentImageService.syncContentImageUsage(
          {
            contentType: ContentOwnerType.NOTIFICATION,
            contentId: id,
            imageIds: command.contentImageRefs ?? [],
            actorId,
            manager,
          }
        );
      }

      return updatedEntity;
    });

    if (!updated) {
      throw new CustomException(
        NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return NotificationResponse.fromEntity(updated);
  }

  private async prepareAttachmentUploads(
    files: Express.Multer.File[],
    attachmentNames?: string[]
  ): Promise<UploadedAttachment[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploads: UploadedAttachment[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const resolvedName = this.resolveAttachmentName(
        attachmentNames?.[index],
        file
      );
      const uploaded = await this.uploadAttachment(file, resolvedName);
      uploads.push({
        fileName: resolvedName,
        fileUrl: uploaded.url,
        fileKey: uploaded.key,
        mimeType: file.mimetype,
        fileSize: file.size,
      });
    }

    return uploads;
  }

  private ensureAttachmentLimit(
    currentAttachments: ContentAttachmentEntity[],
    options: {
      removeExistingFiles?: boolean;
      attachmentIdsToRemove?: string[] | undefined;
      newFilesCount: number;
      errorCode: NotificationErrorCode;
    }
  ): void {
    if (options.newFilesCount > ATTACHMENT_MAX_COUNT) {
      throw new CustomException(
        options.errorCode,
        HttpStatus.BAD_REQUEST,
        ATTACHMENT_MAX_COUNT_MESSAGE
      );
    }

    const removalSet = new Set(options.attachmentIdsToRemove ?? []);
    const remainingCount = options.removeExistingFiles
      ? 0
      : currentAttachments.filter(
          (attachment) => !removalSet.has(attachment.id)
        ).length;
    const total = remainingCount + options.newFilesCount;

    if (total > ATTACHMENT_MAX_COUNT) {
      throw new CustomException(
        options.errorCode,
        HttpStatus.BAD_REQUEST,
        ATTACHMENT_MAX_COUNT_MESSAGE
      );
    }
  }

  private async removeAllAttachments(
    ownerType: ContentOwnerType,
    ownerId: string,
    manager: EntityManager
  ): Promise<void> {
    const attachments =
      await this.contentAttachmentRepository.findAllByOwner(
        ownerType,
        ownerId,
        manager
      );

    if (!attachments.length) {
      return;
    }

    for (const attachment of attachments) {
      await this.deleteExistingFile({
        fileKey: attachment.fileKey,
        fileUrl: attachment.fileUrl,
      });
    }

    await this.contentAttachmentRepository.deleteByOwner(
      ownerType,
      ownerId,
      manager
    );
  }

  private async removeAttachmentsByIds(
    ownerType: ContentOwnerType,
    ownerId: string,
    attachmentIds: string[],
    manager: EntityManager
  ): Promise<void> {
    if (!attachmentIds.length) {
      return;
    }

    const attachments = await this.contentAttachmentRepository.findByIds(
      ownerType,
      ownerId,
      attachmentIds,
      manager
    );

    if (!attachments.length) {
      return;
    }

    for (const attachment of attachments) {
      await this.deleteExistingFile({
        fileKey: attachment.fileKey,
        fileUrl: attachment.fileUrl,
      });
    }

    await this.contentAttachmentRepository.deleteByIds(
      attachments.map((attachment) => attachment.id),
      manager
    );

    await this.contentAttachmentRepository.reassignIndexes(
      ownerType,
      ownerId,
      manager
    );
  }

  private async uploadAttachment(
    file: Express.Multer.File,
    preferredFilename: string
  ): Promise<S3UploadResult> {
    const size = file.size ?? 0;

    if (size > this.attachmentMaxSizeBytes) {
      throw new CustomException(
        NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT,
        HttpStatus.BAD_REQUEST,
        this.attachmentMessages.attachmentSizeMessage
      );
    }

    if (!isAllowedAttachment(file)) {
      throw new CustomException(
        NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT,
        HttpStatus.BAD_REQUEST,
        this.attachmentMessages.allowedAttachmentMessage
      );
    }

    const uploadPayload: UploadFile = {
      originalname: preferredFilename,
      buffer: file.buffer,
      mimetype: file.mimetype,
    };

    const result = await this.s3ClientService.uploadNotificationAttachment(
      uploadPayload,
      preferredFilename
    );
    this.logger.log(`Uploaded file to S3: ${result.key}`);
    return result;
  }

  private async deleteExistingFile(options: {
    fileKey?: string | null;
    fileUrl?: string | null;
  }): Promise<void> {
    const key =
      options.fileKey ??
      (options.fileUrl
        ? this.s3ClientService.extractKeyFromUrl(options.fileUrl)
        : null);
    if (!key) {
      this.logger.warn(
        `기존 파일 키 추출 실패: ${options.fileUrl ?? 'unknown url'}`
      );
      return;
    }

    await this.s3ClientService.deleteFile(key);
    this.logger.log(`Deleted file from S3: ${key}`);
  }

  private resolveAttachmentName(
    requestedName: string | undefined,
    file: Express.Multer.File
  ): string {
    const sanitized = sanitizeAttachmentName(
      requestedName ?? file.originalname,
      file.originalname
    );
    return ensureAttachmentExtension(sanitized, file.originalname);
  }
}
