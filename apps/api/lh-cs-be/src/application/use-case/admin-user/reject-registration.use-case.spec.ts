import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RejectRegistrationUseCase } from './reject-registration.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserRegistrationRejectionRepository } from '../../../infrastructure/repository/user-registration-rejection.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { randomBytes } from 'crypto';
import { UserApprovalStatusEnum } from '@/infrastructure/repository/entity';

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('random')),
}));

describe('RejectRegistrationUseCase', () => {
  let useCase: RejectRegistrationUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let rejectionRepository: jest.Mocked<UserRegistrationRejectionRepository>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  const baseUser: any = {
    id: 'user-1',
    approvalStatus: UserApprovalStatusEnum.PENDING,
    department: '세일즈',
    createdAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    rejectionRepository = {
      createHistory: jest.fn(),
    } as any;

    phoneEncryptionService = {
      hash: jest.fn().mockReturnValue('hashed-random'),
    } as any;

    useCase = new RejectRegistrationUseCase(
      userRepository,
      rejectionRepository,
      phoneEncryptionService
    );
  });

  it('가입 대기 사용자를 거절한다', async () => {
    const updatedUser = {
      ...baseUser,
      approvalStatus: UserApprovalStatusEnum.REJECTED,
    };
    userRepository.findById
      .mockResolvedValueOnce(baseUser)
      .mockResolvedValueOnce(updatedUser as any);

    const result = await useCase.execute('user-1', 'admin', '사유');

    expect(rejectionRepository.createHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        rejectedBy: 'admin',
        reason: '사유',
      })
    );
    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        approvalStatus: UserApprovalStatusEnum.REJECTED,
        status: expect.any(String),
        inactiveAt: expect.any(Date),
        phoneHash: 'hashed-random',
        approvalCompletedAt: null,
        approvalCompletedByUserId: null,
      })
    );
    expect(result).toBe(updatedUser);
    expect(phoneEncryptionService.hash).toHaveBeenCalledWith('72616e646f6d');
  });

  it('사용자를 찾지 못하면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', 'admin')
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('이미 거절된 사용자면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue({
      ...baseUser,
      approvalStatus: UserApprovalStatusEnum.REJECTED,
    });

    await expect(
      useCase.execute('user-1', 'admin')
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
