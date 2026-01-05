import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { ContentAttachmentEntity } from './entity/content-attachment.entity';

type AttachmentCreateInput = {
  ownerType: ContentOwnerType;
  ownerId: string;
  attachmentIndex?: number | null;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  mimeType?: string | null;
  fileSize?: number | null;
  createdBy: string;
};

@Injectable()
export class ContentAttachmentRepository {
  constructor(
    @InjectRepository(ContentAttachmentEntity)
    private readonly contentAttachmentRepo: Repository<ContentAttachmentEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<ContentAttachmentEntity> {
    return manager
      ? manager.getRepository(ContentAttachmentEntity)
      : this.contentAttachmentRepo;
  }

  async createAttachment(
    data: AttachmentCreateInput,
    manager?: EntityManager
  ): Promise<ContentAttachmentEntity> {
    const repo = this.getRepository(manager);
    const entity = repo.create({
      ownerType: data.ownerType,
      ownerId: data.ownerId,
      attachmentIndex: data.attachmentIndex ?? null,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileKey: data.fileKey,
      mimeType: data.mimeType ?? null,
      fileSize: data.fileSize?.toString() ?? null,
      createdBy: data.createdBy,
    });
    return repo.save(entity);
  }

  async createAttachments(
    inputs: AttachmentCreateInput[],
    manager?: EntityManager
  ): Promise<ContentAttachmentEntity[]> {
    if (!inputs.length) {
      return [];
    }

    const repo = this.getRepository(manager);
    const entities = repo.create(
      inputs.map((input) => ({
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        attachmentIndex: input.attachmentIndex ?? null,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        mimeType: input.mimeType ?? null,
        fileSize: input.fileSize?.toString() ?? null,
        createdBy: input.createdBy,
      }))
    );

    return repo.save(entities);
  }

  async findAllByOwner(
    ownerType: ContentOwnerType,
    ownerId: string,
    manager?: EntityManager
  ): Promise<ContentAttachmentEntity[]> {
    const repo = this.getRepository(manager);
    return repo.find({
      where: { ownerType, ownerId },
      order: {
        attachmentIndex: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async findByIds(
    ownerType: ContentOwnerType,
    ownerId: string,
    ids: string[],
    manager?: EntityManager
  ): Promise<ContentAttachmentEntity[]> {
    if (!ids.length) {
      return [];
    }

    const repo = this.getRepository(manager);
    return repo.find({
      where: {
        ownerType,
        ownerId,
        id: In(ids),
      },
    });
  }

  async deleteById(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.delete(id);
  }

  async deleteByIds(ids: string[], manager?: EntityManager): Promise<void> {
    if (!ids.length) {
      return;
    }

    const repo = this.getRepository(manager);
    await repo.delete(ids);
  }

  async deleteByOwner(
    ownerType: ContentOwnerType,
    ownerId: string,
    manager?: EntityManager
  ): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.delete({ ownerType, ownerId } as {
      ownerType: ContentOwnerType;
      ownerId: string;
    });
  }

  async reassignIndexes(
    ownerType: ContentOwnerType,
    ownerId: string,
    manager?: EntityManager
  ): Promise<void> {
    const repo = this.getRepository(manager);
    const attachments = await repo.find({
      where: { ownerType, ownerId },
      order: {
        attachmentIndex: 'ASC',
        createdAt: 'ASC',
      },
    });

    let index = 1;
    for (const attachment of attachments) {
      if (attachment.attachmentIndex === index) {
        index += 1;
        continue;
      }

      await repo.update(attachment.id, { attachmentIndex: index });
      index += 1;
    }
  }
}
