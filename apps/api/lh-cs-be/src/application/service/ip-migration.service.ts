import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityTarget } from 'typeorm';
import { IpEncryptionService } from './ip-encryption.service';
import { LoginAllowedIpEntity } from '@/infrastructure/repository/entity/login-allowed-ip.entity';
import { LoginAllowedIpHistoryEntity } from '@/infrastructure/repository/entity/login-allowed-ip-history.entity';
import { AdminLogEntity } from '@/infrastructure/repository/entity/admin-log.entity';
import { LoginLogEntity } from '@/infrastructure/repository/entity/login-log.entity';
import { FreeTourLogEntity } from '@/infrastructure/repository/entity/free-tour-log.entity';
import { ConsultationLogEntity } from '@/infrastructure/repository/entity/consultation-log.entity';
import { UserSessionEntity } from '@/infrastructure/repository/entity/user-session.entity';

type MigrationResult = {
  table: string;
  updated: number;
};

@Injectable()
export class IpMigrationService {
  private readonly logger = new Logger(IpMigrationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly ipEncryptionService: IpEncryptionService
  ) {}

  async migrateAll(): Promise<MigrationResult[]> {
    const tasks: Array<Promise<MigrationResult>> = [
      this.migrateTable(LoginAllowedIpEntity, 'ipAddress'),
      this.migrateTable(LoginAllowedIpHistoryEntity, 'ipAddress'),
      this.migrateTable(AdminLogEntity, 'ipAddress'),
      this.migrateTable(LoginLogEntity, 'ipAddress'),
      this.migrateTable(FreeTourLogEntity, 'ipAddress'),
      this.migrateTable(ConsultationLogEntity, 'ipAddress'),
      this.migrateTable(UserSessionEntity, 'ipAddress'),
    ];

    return Promise.all(tasks);
  }

  private async migrateTable<Entity extends { id: any }>(
    entity: EntityTarget<Entity>,
    column: keyof Entity
  ): Promise<MigrationResult> {
    const repository = this.dataSource.getRepository(entity);
    const rows = await repository
      .createQueryBuilder('t')
      .select(['t.id', `t.${String(column)}`])
      .where(`t.${String(column)} IS NOT NULL`)
      .getMany();

    let updated = 0;

    for (const row of rows) {
      const current = row[column];
      if (typeof current !== 'string' || current.length === 0) {
        continue;
      }

      const decrypted = this.ipEncryptionService.decrypt(current);
      if (decrypted) {
        const reEncrypted = this.ipEncryptionService.encrypt(decrypted);
        if (reEncrypted === current) {
          continue; // 이미 암호화 되어 있음
        }
      }

      const nextEncrypted = this.ipEncryptionService.encrypt(
        decrypted ?? current
      );
      if (!nextEncrypted || nextEncrypted === current) {
        continue;
      }

      await repository.update((row as any).id, {
        [column]: nextEncrypted,
      } as any);
      updated += 1;
    }

    this.logger.log(
      `[IP 마이그레이션] ${repository.metadata.tableName}: ${updated}건 업데이트`
    );

    return { table: repository.metadata.tableName, updated };
  }
}
