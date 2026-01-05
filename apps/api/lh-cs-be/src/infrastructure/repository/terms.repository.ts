import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { TermsEntity } from './entity/terms.entity';

@Injectable()
export class TermsRepository {
  constructor(
    @InjectRepository(TermsEntity)
    private readonly repository: Repository<TermsEntity>
  ) {}

  async findAllPublished(referenceDate: Date = new Date()): Promise<TermsEntity[]> {
    return this.repository.find({
      where: [
        { publishedAt: null },
        { publishedAt: LessThanOrEqual(referenceDate) },
      ],
      order: {
        isRequired: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findByIds(termsIds: string[]): Promise<TermsEntity[]> {
    if (!termsIds.length) {
      return [];
    }

    return this.repository.find({
      where: { id: In(termsIds) },
    });
  }
}
