import { GetPendingRegistrationsUseCase } from './get-pending-registrations.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';

describe('GetPendingRegistrationsUseCase', () => {
  let useCase: GetPendingRegistrationsUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  beforeEach(() => {
    userRepository = {
      findAll: jest.fn(),
      findByIds: jest.fn(),
    } as any;

    phoneEncryptionService = {
      hash: jest.fn().mockReturnValue('hashed'),
      encrypt: jest.fn(),
      decrypt: jest.fn().mockReturnValue('01012345678'),
    } as any;

    useCase = new GetPendingRegistrationsUseCase(
      userRepository,
      phoneEncryptionService
    );
  });

  it('승인 대기 목록을 반환한다', async () => {
    const now = new Date();
    const approvedAt = new Date(now.getTime() + 1000);
    userRepository.findAll.mockResolvedValue({
      users: [
        {
          id: 'user-1',
          username: 'pending-user-1',
          name: '홍길동',
          department: null,
          createdAt: now,
          phoneEncrypted: Buffer.from('enc'),
          phoneIv: Buffer.from('iv'),
          phoneTag: Buffer.from('tag'),
          approvalCompletedAt: approvedAt,
          approvalCompletedByUserId: 'admin-1',
        },
      ] as any,
      total: 1,
    });
    userRepository.findByIds.mockResolvedValue([
      { id: 'admin-1', username: 'approver' } as any,
    ]);

    const result = await useCase.execute(1, 20, undefined);

    expect(result.items[0]).toEqual({
      userId: 'user-1',
      username: 'pending-user-1',
      name: '홍길동',
      department: null,
      phoneNumber: '01012345678',
      signedAt: now,
      approvedAt,
      approvedBy: 'approver',
    });
    expect(result.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    expect(userRepository.findByIds).toHaveBeenCalledWith(['admin-1']);
  });
});
