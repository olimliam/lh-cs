import { DataSource, Repository } from 'typeorm';
import { IpMigrationService } from './ip-migration.service';
import { IpEncryptionService } from './ip-encryption.service';
import { LoginAllowedIpEntity } from '@/infrastructure/repository/entity/login-allowed-ip.entity';
import { AdminLogEntity } from '@/infrastructure/repository/entity/admin-log.entity';

type MockRepoRow = { id: string; ipAddress: string };

const makeRepository = (tableName: string, rows: MockRepoRow[]) => {
  const updateMock = jest.fn();
  const qb = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(async () => rows),
  };

  return {
    metadata: { tableName },
    createQueryBuilder: jest.fn(() => qb),
    update: updateMock,
  } as unknown as Repository<MockRepoRow>;
};

describe('IpMigrationService', () => {
  let service: IpMigrationService;
  let dataSource: jest.Mocked<DataSource>;
  let encryptionService: jest.Mocked<IpEncryptionService>;

  const plainIpRow = { id: '1', ipAddress: '127.0.0.1' };
  const encryptedIpRow = { id: '2', ipAddress: 'enc(192.168.0.1)' };

  beforeEach(() => {
    const loginAllowedIpRepo = makeRepository(
      'login_allowed_ip',
      [plainIpRow, encryptedIpRow]
    );
    const adminLogRepo = makeRepository('admin_log', []);

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === LoginAllowedIpEntity) return loginAllowedIpRepo;
        if (entity === AdminLogEntity) return adminLogRepo;
        return makeRepository('unused', []);
      }),
    } as unknown as jest.Mocked<DataSource>;

    encryptionService = {
      encrypt: jest.fn((ip) => (ip ? `enc(${ip})` : undefined)),
      decrypt: jest.fn((cipher) =>
        cipher?.startsWith('enc(') ? cipher.slice(4, -1) : undefined
      ),
    } as unknown as jest.Mocked<IpEncryptionService>;

    service = new IpMigrationService(dataSource, encryptionService);
  });

  it('평문 IP는 암호화하고, 이미 암호화된 값은 그대로 유지한다', async () => {
    const result = await service.migrateAll();

    const loginRepo = dataSource.getRepository(LoginAllowedIpEntity) as any;
    const adminRepo = dataSource.getRepository(AdminLogEntity) as any;

    // plain IP 업데이트 1건, 암호화된 값은 업데이트 안 함
    expect(loginRepo.update).toHaveBeenCalledTimes(1);
    expect(loginRepo.update).toHaveBeenCalledWith('1', {
      ipAddress: 'enc(127.0.0.1)',
    });
    expect(encryptionService.encrypt).toHaveBeenCalledWith('127.0.0.1');
    expect(encryptionService.decrypt).toHaveBeenCalledWith('enc(192.168.0.1)');

    // 빈 테이블은 업데이트 없음
    expect(adminRepo.update).not.toHaveBeenCalled();

    // 결과에는 각 테이블별 업데이트 건수가 포함됨
    const loginResult = result.find(
      (item) => item.table === 'login_allowed_ip'
    );
    expect(loginResult?.updated).toBe(1);
  });
});
