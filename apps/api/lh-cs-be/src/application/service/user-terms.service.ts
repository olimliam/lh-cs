import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TermsRepository } from '../../infrastructure/repository/terms.repository';
import { UpdateUserTermsCommand } from '../dto/command/update-user-terms.command';
import { TermsEntity, UserEntity } from '@/infrastructure/repository/entity';
import { UserRepository } from '@/infrastructure/repository/user.repository';

export interface UserTermsStatus {
  id: string;
  title: string;
  version: string;
  isRequired: boolean;
  content: string;
  publishedAt?: Date;
  agreedAt?: Date | null;
}

@Injectable()
export class UserTermsService {
  constructor(
    private readonly termsRepository: TermsRepository,
    private readonly userRepository: UserRepository
  ) {}

  async getUserTermsStatus(userId: string): Promise<UserTermsStatus[]> {
    const [terms, user] = await Promise.all([
      this.termsRepository.findAllPublished(),
      this.userRepository.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mergeTermsWithUser(terms, user);
  }

  async updateUserTerms(
    command: UpdateUserTermsCommand
  ): Promise<UserTermsStatus[]> {
    const { userId, agreements } = command;

    const normalizedAgreements = this.normalizeAgreements(agreements);

    const terms = await this.termsRepository.findAllPublished();

    const termsMap = new Map(terms.map((term) => [term.id, term]));

    const invalidIds = normalizedAgreements
      .filter(({ termsId }) => !termsMap.has(termsId))
      .map(({ termsId }) => termsId);

    if (invalidIds.length) {
      throw new BadRequestException(
        `존재하지 않거나 비공개 상태인 약관 ID가 포함되어 있습니다: ${invalidIds.join(', ')}`
      );
    }

    const requiredTerms = terms.filter((term) => Boolean(term.isRequired));
    const missingRequired = requiredTerms.filter((term) => {
      const agreement = normalizedAgreements.find(
        ({ termsId }) => termsId === term.id
      );
      return !agreement?.agreed;
    });

    if (missingRequired.length) {
      const missingTitle = missingRequired.map((term) => term.title).join(', ');
      throw new BadRequestException(
        `필수 약관 동의가 누락되었습니다: ${missingTitle}`
      );
    }

    const hasRequiredTerms = requiredTerms.length > 0;
    const isConfirmedTerms = hasRequiredTerms
      ? true
      : normalizedAgreements.some((agreement) => agreement.agreed);

    const updatedUser = await this.userRepository.update(userId, {
      isConfirmedTerms,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.mergeTermsWithUser(terms, updatedUser);
  }

  private normalizeAgreements(
    agreements: UpdateUserTermsCommand['agreements']
  ): UpdateUserTermsCommand['agreements'] {
    const deduplicated = new Map<string, boolean>();

    for (const agreement of agreements) {
      deduplicated.set(agreement.termsId, agreement.agreed);
    }

    return Array.from(deduplicated.entries()).map(([termsId, agreed]) => ({
      termsId,
      agreed,
    }));
  }

  private mergeTermsWithUser(
    terms: TermsEntity[],
    user: UserEntity
  ): UserTermsStatus[] {
    const confirmedAt =
      user.isConfirmedTerms === true
        ? user.updatedAt ?? user.createdAt ?? null
        : null;

    return terms.map((term) => {
      const isRequired = Boolean(term.isRequired);
      const agreed = isRequired ? user.isConfirmedTerms : false;

      return {
        id: term.id,
        title: term.title,
        version: term.version,
        isRequired,
        content: term.content,
        publishedAt: term.publishedAt ?? undefined,
        agreedAt: agreed ? confirmedAt : null,
      };
    });
  }
}
