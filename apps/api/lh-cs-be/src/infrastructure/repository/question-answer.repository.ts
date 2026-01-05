import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { QuestionAnswerEntity } from './entity/question-answer.entity';
import { ContentAttachmentEntity } from './entity/content-attachment.entity';
import { ContentImageEntity } from './entity/content-image.entity';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';

export interface QuestionAnswerPaginationOptions {
  page: number;
  limit: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'ASC' | 'DESC';
  isPublic?: boolean;
}

@Injectable()
export class QuestionAnswerRepository {
  constructor(
    @InjectRepository(QuestionAnswerEntity)
    private readonly questionAnswerRepo: Repository<QuestionAnswerEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<QuestionAnswerEntity> {
    return manager
      ? manager.getRepository(QuestionAnswerEntity)
      : this.questionAnswerRepo;
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
  ): Promise<QuestionAnswerEntity> {
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
    return this.findById(saved.id, manager).then((result) => result ?? saved);
  }

  async findById(
    id: string,
    manager?: EntityManager
  ): Promise<QuestionAnswerEntity | null> {
    const qb = this.buildBaseQuery(manager);
    qb.where('question_answer.id = :id', { id });
    return qb.getOne();
  }

  async findPaginated(
    options: QuestionAnswerPaginationOptions,
    manager?: EntityManager
  ): Promise<{ data: QuestionAnswerEntity[]; total: number }> {
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
      qb.andWhere('question_answer.isPublic = :isPublic', {
        isPublic: options.isPublic,
      });
    }

    qb.orderBy(`question_answer.${columnMap[orderBy]}`, orderDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        QuestionAnswerEntity,
        | 'title'
        | 'content'
        | 'fileUrl'
        | 'isPublic'
        | 'updatedBy'
      >
    >,
    manager?: EntityManager
  ): Promise<QuestionAnswerEntity | null> {
    const payload: Partial<QuestionAnswerEntity> = {};

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
      return this.findById(id);
    }

    const repo = this.getRepository(manager);
    await repo
      .createQueryBuilder()
      .update(QuestionAnswerEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    return this.findById(id, manager);
  }

  private buildBaseQuery(
    manager?: EntityManager
  ): SelectQueryBuilder<QuestionAnswerEntity> {
    const repo = this.getRepository(manager);
    const qb: SelectQueryBuilder<QuestionAnswerEntity> =
      repo.createQueryBuilder('question_answer');

    qb.leftJoinAndSelect('question_answer.createdByUser', 'createdByUser');
    qb.leftJoinAndSelect('question_answer.updatedByUser', 'updatedByUser');
    qb.leftJoinAndMapMany(
      'question_answer.contentAttachments',
      ContentAttachmentEntity,
      'contentAttachment',
      'contentAttachment.ownerType = :ownerType AND contentAttachment.ownerId = question_answer.id',
      { ownerType: ContentOwnerType.QUESTION_ANSWER }
    );
    qb.leftJoinAndMapMany(
      'question_answer.contentImages',
      ContentImageEntity,
      'contentImages',
      'contentImages.contentType = :contentImageOwnerType AND contentImages.contentId = question_answer.id',
      { contentImageOwnerType: ContentOwnerType.QUESTION_ANSWER }
    );

    qb.where('1 = 1');
    qb.addOrderBy('contentAttachment.attachmentIndex IS NULL', 'ASC');
    qb.addOrderBy('contentAttachment.attachmentIndex', 'ASC');

    return qb;
  }
}
