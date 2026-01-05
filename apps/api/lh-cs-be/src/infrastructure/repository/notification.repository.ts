import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { ContentAttachmentEntity } from './entity/content-attachment.entity';
import { ContentImageEntity } from './entity/content-image.entity';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';

export interface NotificationPaginationOptions {
  page: number;
  limit: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'ASC' | 'DESC';
  isPublic?: boolean;
}

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<NotificationEntity> {
    return manager
      ? manager.getRepository(NotificationEntity)
      : this.notificationRepo;
  }

  async create(
    data: {
      title: string;
      content: string;
      fileUrl?: string | null;
      isPublic?: boolean;
      createdBy: string;
      updatedBy: string;
    },
    manager?: EntityManager
  ): Promise<NotificationEntity> {
    const repo = this.getRepository(manager);
    const entity = repo.create({
      title: data.title,
      content: data.content,
      fileUrl: data.fileUrl ?? null,
      isPublic: data.isPublic ?? true,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
    const saved = await repo.save(entity);
    return this.findById(saved.id, manager).then((result) =>
      result ?? saved
    );
  }

  async findById(
    id: string,
    manager?: EntityManager
  ): Promise<NotificationEntity | null> {
    const qb = this.buildBaseQuery(manager);
    qb.where('notification.id = :id', { id });
    return qb.getOne();
  }

  async findPaginated(
    options: NotificationPaginationOptions,
    manager?: EntityManager
  ): Promise<{ data: NotificationEntity[]; total: number }> {
    const page = Math.max(options.page, 1);
    const limit = Math.max(options.limit, 1);
    const orderBy = options.orderBy ?? 'createdAt';
    const orderDirection = options.orderDirection ?? 'DESC';

    const columnMap: Record<'createdAt' | 'updatedAt', string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    } as const;

    const qb = this.buildBaseQuery(manager);

    if (options.isPublic !== undefined) {
      qb.andWhere('notification.isPublic = :isPublic', {
        isPublic: options.isPublic,
      });
    }

    qb.orderBy(`notification.${columnMap[orderBy]}`, orderDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        NotificationEntity,
        | 'title'
        | 'content'
        | 'fileUrl'
        | 'isPublic'
        | 'updatedBy'
      >
    >,
    manager?: EntityManager
  ): Promise<NotificationEntity | null> {
    const payload: Partial<NotificationEntity> = {};

    if (data.title !== undefined) {
      payload.title = data.title;
    }

    if (data.content !== undefined) {
      payload.content = data.content;
    }

    if (data.fileUrl !== undefined) {
      payload.fileUrl = data.fileUrl ?? null;
    }

    if (data.isPublic !== undefined) {
      payload.isPublic = data.isPublic;
    }

    if (data.updatedBy !== undefined) {
      payload.updatedBy = data.updatedBy;
    }

    if (Object.keys(payload).length === 0) {
      return this.findById(id, manager);
    }

    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    return this.findById(id, manager);
  }

  private buildBaseQuery(
    manager?: EntityManager
  ): SelectQueryBuilder<NotificationEntity> {
    const repo = this.getRepository(manager);
    const qb: SelectQueryBuilder<NotificationEntity> =
      repo.createQueryBuilder('notification');

    qb.leftJoinAndSelect('notification.createdByUser', 'createdByUser');
    qb.leftJoinAndSelect('notification.updatedByUser', 'updatedByUser');
    qb.leftJoinAndMapMany(
      'notification.contentAttachments',
      ContentAttachmentEntity,
      'contentAttachment',
      'contentAttachment.ownerType = :ownerType AND contentAttachment.ownerId = notification.id',
      { ownerType: ContentOwnerType.NOTIFICATION }
    );
    qb.leftJoinAndMapMany(
      'notification.contentImages',
      ContentImageEntity,
      'contentImages',
      'contentImages.contentType = :contentImageOwnerType AND contentImages.contentId = notification.id',
      { contentImageOwnerType: ContentOwnerType.NOTIFICATION }
    );

    qb.where('1 = 1');
    qb.addOrderBy('contentAttachment.attachmentIndex IS NULL', 'ASC');
    qb.addOrderBy('contentAttachment.attachmentIndex', 'ASC');

    return qb;
  }
}
