import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { ContentImageEntity } from './entity/content-image.entity';

@Injectable()
export class ContentImageRepository {
  constructor(
    @InjectRepository(ContentImageEntity)
    private readonly contentImageRepo: Repository<ContentImageEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<ContentImageEntity> {
    return manager
      ? manager.getRepository(ContentImageEntity)
      : this.contentImageRepo;
  }

  async createImage(
    data: {
      contentType: ContentOwnerType;
      contentId?: string | null;
      s3Key: string;
      url: string;
      fileName?: string | null;
      contentTypeHeader?: string | null;
      uploadedBy: string;
      isUsed?: boolean;
    },
    manager?: EntityManager
  ): Promise<ContentImageEntity> {
    const repo = this.getRepository(manager);
    const entity = repo.create({
      contentType: data.contentType,
      contentId: data.contentId ?? null,
      s3Key: data.s3Key,
      url: data.url,
      fileName: data.fileName ?? null,
      contentTypeHeader: data.contentTypeHeader ?? null,
      uploadedBy: data.uploadedBy,
      isUsed: data.isUsed ?? false,
    });
    return repo.save(entity);
  }

  async findByIds(
    ids: readonly string[],
    manager?: EntityManager
  ): Promise<ContentImageEntity[]> {
    if (!ids.length) {
      return [];
    }
    const repo = this.getRepository(manager);
    return repo.find({
      where: { id: In(ids as string[]) },
      order: { createdAt: 'ASC' },
    });
  }

  async findByContent(
    contentType: ContentOwnerType,
    contentId: string,
    manager?: EntityManager
  ): Promise<ContentImageEntity[]> {
    const repo = this.getRepository(manager);
    return repo.find({
      where: {
        contentType,
        contentId,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async linkImagesToContent(
    params: {
      contentType: ContentOwnerType;
      contentId: string;
      imageIds: readonly string[];
    },
    manager?: EntityManager
  ): Promise<void> {
    if (!params.imageIds.length) {
      return;
    }

    const repo = this.getRepository(manager);

    await repo
      .createQueryBuilder()
      .update(ContentImageEntity)
      .set({
        contentType: params.contentType,
        contentId: params.contentId,
        isUsed: true,
      })
      .where({ id: In(params.imageIds as string[]) })
      .execute();
  }

  async unlinkImagesForContent(
    params: {
      contentType: ContentOwnerType;
      contentId: string;
      excludeImageIds?: readonly string[];
    },
    manager?: EntityManager
  ): Promise<void> {
    const repo = this.getRepository(manager);
    const qb = repo
      .createQueryBuilder()
      .update(ContentImageEntity)
      .set({
        contentId: null,
        isUsed: false,
      })
      .where('content_type = :contentType', {
        contentType: params.contentType,
      })
      .andWhere('content_id = :contentId', { contentId: params.contentId });

    if (params.excludeImageIds && params.excludeImageIds.length > 0) {
      qb.andWhere('id NOT IN (:...excludeIds)', {
        excludeIds: params.excludeImageIds,
      });
    }

    await qb.execute();
  }

  async markAsUnused(
    imageIds: readonly string[],
    manager?: EntityManager
  ): Promise<void> {
    if (!imageIds.length) {
      return;
    }

    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(ContentImageEntity)
      .set({ isUsed: false })
      .where({ id: In(imageIds as string[]) })
      .execute();
  }
}
