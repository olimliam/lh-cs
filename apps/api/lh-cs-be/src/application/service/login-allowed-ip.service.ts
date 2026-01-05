import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LoginAllowedIpRepository } from '@/infrastructure/repository/login-allowed-ip.repository';
import { LoginAllowedIpHistoryRepository } from '@/infrastructure/repository/login-allowed-ip-history.repository';
import { normalizeIp } from '@/common/utils/ip-utils';
import { CreateLoginAllowedIpCommand } from '../dto/command/create-login-allowed-ip.command';
import { UpdateLoginAllowedIpCommand } from '../dto/command/update-login-allowed-ip.command';
import {
  LoginAllowedIpResponse,
  PaginatedLoginAllowedIpResponse,
} from '@/presentation/dto/response/login-allowed-ip.response';
import { LoginAllowedIpHistoryAction } from '@/infrastructure/repository/entity/login-allowed-ip-history.entity';
import { LoginAllowedIpEntity } from '@/infrastructure/repository/entity/login-allowed-ip.entity';
import { IpEncryptionService } from './ip-encryption.service';

type ActorInfo = {
  id: string;
  username: string;
};

@Injectable()
export class LoginAllowedIpService {
  private readonly logger = new Logger(LoginAllowedIpService.name);

  constructor(
    private readonly loginAllowedIpRepository: LoginAllowedIpRepository,
    private readonly loginAllowedIpHistoryRepository: LoginAllowedIpHistoryRepository,
    private readonly ipEncryptionService: IpEncryptionService
  ) {}

  async isIpAllowed(ipAddress?: string | null): Promise<boolean> {
    const cleanedCandidates = this.normalizeIpCandidates(ipAddress);
    const encryptedCandidates = this.encryptIpCandidates(cleanedCandidates);
    const searchCandidates = [
      ...new Set([...encryptedCandidates, ...cleanedCandidates]),
    ];
    const primaryCandidate = cleanedCandidates[0] ?? ipAddress ?? '확인 불가';

    this.logger.log(`로그인 시도 IP: ${primaryCandidate}`);

    const isBlocked =
      await this.loginAllowedIpRepository.isIpBlocked(searchCandidates);

    if (isBlocked) {
      this.logger.warn(
        '차단 목록에 존재하는 IP로 로그인 요청이 감지되었습니다.'
      );
      return false;
    }

    const hasActiveWhitelist = await this.loginAllowedIpRepository.hasActive();
    if (!hasActiveWhitelist) {
      // Whitelist 비활성 상태(레코드 없음)에서는 모든 IP 허용
      return true;
    }

    if (searchCandidates.length === 0) {
      this.logger.warn('IP 주소를 확인할 수 없어 로그인 요청을 차단했습니다.');
      return false;
    }

    return this.loginAllowedIpRepository.isIpWhitelisted(searchCandidates);
  }

  private normalizeIpCandidates(ipAddress?: string | null): string[] {
    const normalized = normalizeIp(ipAddress);
    if (!normalized) {
      return [];
    }

    const canonical = normalized.toLowerCase();
    const candidates = new Set<string>([canonical]);

    if (canonical === '::1') {
      candidates.add('127.0.0.1');
    }

    if (canonical === '127.0.0.1') {
      candidates.add('::1');
    }

    return Array.from(candidates);
  }

  private encryptIpCandidates(ipCandidates: string[]): string[] {
    const encrypted = ipCandidates
      .map((candidate) => this.ipEncryptionService.encrypt(candidate))
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(encrypted));
  }

  async getPaginated(params: {
    page: number;
    limit: number;
    orderDirection?: 'ASC' | 'DESC';
  }): Promise<PaginatedLoginAllowedIpResponse> {
    const page = Math.max(params.page, 1);
    const limit = Math.max(params.limit, 1);
    const { data, total } = await this.loginAllowedIpRepository.findPaginated({
      page,
      limit,
      orderDirection: params.orderDirection,
    });

    const decrypted = data.map((item) => this.toResponseEntity(item));

    return PaginatedLoginAllowedIpResponse.from(decrypted, total, page, limit);
  }

  async create(
    command: CreateLoginAllowedIpCommand,
    actor: ActorInfo | null | undefined
  ): Promise<LoginAllowedIpResponse> {
    if (!actor?.id || !actor.username) {
      throw new BadRequestException('IP 변경 수행자를 확인할 수 없습니다.');
    }

    const normalizedIp = this.normalizeAndValidateIp(command.ipAddress);
    const encryptedIp = this.requireEncryptedIp(normalizedIp);
    const descriptionInput = command.description?.trim();
    const description = descriptionInput ? descriptionInput : undefined;

    const existing = await this.loginAllowedIpRepository.findByIp([
      encryptedIp,
    ]);
    if (existing) {
      throw new ConflictException('이미 등록된 IP 주소입니다.');
    }

    const entity = await this.loginAllowedIpRepository.create({
      ipAddress: encryptedIp,
      description,
      isActive: command.isAllowed ?? true,
      createdBy: actor.id,
    });

    await this.loginAllowedIpHistoryRepository.record({
      loginAllowedIpId: entity.id,
      ipAddress: entity.ipAddress,
      description: entity.description ?? null,
      isActive: entity.isActive,
      action: LoginAllowedIpHistoryAction.CREATE,
      changedBy: actor.id,
    });

    return LoginAllowedIpResponse.fromEntity(this.toResponseEntity(entity));
  }

  async update(
    id: string,
    command: UpdateLoginAllowedIpCommand,
    actor: ActorInfo | null | undefined
  ): Promise<LoginAllowedIpResponse> {
    if (!actor?.id) {
      throw new BadRequestException('IP 변경 수행자를 확인할 수 없습니다.');
    }

    const existing = await this.loginAllowedIpRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('등록된 IP 정보를 찾을 수 없습니다.');
    }

    let nextIp: string | undefined;
    if (command.ipAddress !== undefined) {
      nextIp = this.normalizeAndValidateIp(command.ipAddress);
      const nextEncrypted = this.requireEncryptedIp(nextIp);

      if (nextEncrypted !== existing.ipAddress) {
        const duplicated = await this.loginAllowedIpRepository.findByIp([
          nextEncrypted,
        ]);
        if (duplicated && duplicated.id !== id) {
          throw new ConflictException('이미 등록된 IP 주소입니다.');
        }
      }

      nextIp = nextEncrypted;
    }

    let description: string | null | undefined;
    if (command.description !== undefined) {
      const trimmed = command.description.trim();
      description = trimmed.length > 0 ? trimmed : null;
    }

    const updated = await this.loginAllowedIpRepository.update(id, {
      ipAddress: nextIp,
      description,
      isActive: command.isAllowed,
    });

    await this.loginAllowedIpHistoryRepository.record({
      loginAllowedIpId: updated.id,
      ipAddress: updated.ipAddress,
      description: updated.description ?? null,
      isActive: updated.isActive,
      action: LoginAllowedIpHistoryAction.UPDATE,
      changedBy: actor.id,
    });

    return LoginAllowedIpResponse.fromEntity(this.toResponseEntity(updated));
  }

  async delete(id: string, actor: ActorInfo | null | undefined): Promise<void> {
    const existing = await this.loginAllowedIpRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('등록된 IP 정보를 찾을 수 없습니다.');
    }

    if (!actor?.id) {
      throw new BadRequestException('IP 변경 수행자를 확인할 수 없습니다.');
    }

    await this.loginAllowedIpHistoryRepository.record({
      loginAllowedIpId: existing.id,
      ipAddress: existing.ipAddress,
      description: existing.description ?? null,
      isActive: existing.isActive,
      action: LoginAllowedIpHistoryAction.DELETE,
      changedBy: actor.id,
    });

    await this.loginAllowedIpRepository.delete(id);
  }

  private normalizeAndValidateIp(ipAddress: string): string {
    const normalized = normalizeIp(ipAddress);
    if (!normalized) {
      throw new BadRequestException('유효한 IP 주소를 입력해주세요.');
    }
    return normalized.toLowerCase();
  }

  private requireEncryptedIp(normalizedIp: string): string {
    const encrypted = this.ipEncryptionService.encrypt(normalizedIp);
    if (!encrypted) {
      throw new BadRequestException('유효한 IP 주소를 입력해주세요.');
    }
    return encrypted;
  }

  private toResponseEntity(entity: LoginAllowedIpEntity): LoginAllowedIpEntity {
    const decrypted = this.ipEncryptionService.decrypt(entity.ipAddress);
    return {
      ...entity,
      ipAddress: decrypted ?? entity.ipAddress,
    };
  }
}
