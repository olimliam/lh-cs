import { NotFoundException } from '@nestjs/common';
import { ApproveRegistrationUseCase } from '../admin-user/approve-registration.use-case';
import { RejectRegistrationUseCase } from '../admin-user/reject-registration.use-case';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { UserRegistrationRejectionRepository } from '@/infrastructure/repository/user-registration-rejection.repository';
import { PhoneEncryptionService } from '@/application/service/phone-encryption.service';

describe('User status v2 규칙', () => {
  it('UserStatusEnum은 DELETED를 포함하고 SUSPENDED는 포함하지 않는다', () => {
    expect(Object.values(UserStatusEnum)).toContain('DELETED');
    expect(Object.values(UserStatusEnum)).not.toContain('SUSPENDED');
  });

  describe('가입 승인/거절 전이', () => {
    let userRepository: jest.Mocked<UserRepository>;
    let rejectionRepository: jest.Mocked<UserRegistrationRejectionRepository>;
    let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

    beforeEach(() => {
      userRepository = {
        findById: jest.fn(),
        update: jest.fn(),
      } as any;

      rejectionRepository = {
        createHistory: jest.fn(),
      } as any;

      phoneEncryptionService = {
        hash: jest.fn().mockReturnValue('hashed-phone'),
      } as any;
    });

    it('가입 승인 시 ACTIVE/APPROVED로 전환하고 승인 시각을 기록한다', async () => {
      const now = new Date('2024-03-01T00:00:00Z');
      jest.useFakeTimers().setSystemTime(now);

      const user = {
        id: 'user-1',
        status: UserStatusEnum.WAIT,
        approvalStatus: UserApprovalStatusEnum.PENDING,
        loginAttemptCount: 3,
      } as any;

      userRepository.findById.mockResolvedValueOnce(user);
      userRepository.update.mockResolvedValueOnce({
        ...user,
        status: UserStatusEnum.ACTIVE,
        approvalStatus: UserApprovalStatusEnum.APPROVED,
        approvalCompletedAt: now,
        approvalCompletedByUserId: 'admin-1',
      } as any);

      const useCase = new ApproveRegistrationUseCase(userRepository);
      const result = await useCase.execute('user-1', 'admin-1');

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        approvalStatus: UserApprovalStatusEnum.APPROVED,
        status: UserStatusEnum.ACTIVE,
        lockedUntil: null,
        loginAttemptCount: 0,
        inactiveAt: null,
        approvalCompletedAt: now,
        approvalCompletedByUserId: 'admin-1',
      });
      expect(result.status).toBe(UserStatusEnum.ACTIVE);
      expect(result.approvalStatus).toBe(UserApprovalStatusEnum.APPROVED);

      jest.useRealTimers();
    });

    it('가입 거절 시 INACTIVE/REJECTED로 전환하고 개인정보를 정리한다', async () => {
      const rejectionTime = new Date('2024-03-02T12:00:00Z');
      jest.useFakeTimers().setSystemTime(rejectionTime);

      const user = {
        id: 'user-2',
        username: 'pending-user',
        department: '상담부',
        createdAt: new Date('2024-02-29T00:00:00Z'),
        approvalStatus: UserApprovalStatusEnum.PENDING,
        status: UserStatusEnum.WAIT,
        loginAttemptCount: 2,
      } as any;

      userRepository.findById.mockResolvedValueOnce(user);
      userRepository.update.mockResolvedValueOnce({
        ...user,
        status: UserStatusEnum.INACTIVE,
        approvalStatus: UserApprovalStatusEnum.REJECTED,
        name: '거절된 사용자',
        department: null,
        phoneHash: 'hashed-phone',
        phoneEncrypted: null,
        phoneIv: null,
        phoneTag: null,
        loginAttemptCount: 0,
        lockedUntil: null,
      } as any);
      userRepository.findById.mockResolvedValueOnce({
        ...user,
        status: UserStatusEnum.INACTIVE,
        approvalStatus: UserApprovalStatusEnum.REJECTED,
      } as any);

      const useCase = new RejectRegistrationUseCase(
        userRepository,
        rejectionRepository,
        phoneEncryptionService
      );

      const result = await useCase.execute('user-2', 'admin-2', '정보 미비');

      expect(rejectionRepository.createHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          rejectedBy: 'admin-2',
          rejectedAt: rejectionTime,
          signedAt: user.createdAt,
        })
      );

      expect(userRepository.update).toHaveBeenCalledWith('user-2', {
        approvalStatus: UserApprovalStatusEnum.REJECTED,
        status: UserStatusEnum.INACTIVE,
        inactiveAt: rejectionTime,
        approvalCompletedAt: null,
        approvalCompletedByUserId: null,
        phoneHash: 'hashed-phone',
        phoneEncrypted: null,
        phoneIv: null,
        phoneTag: null,
        phoneVerifiedAt: null,
        department: null,
        profileImageUrl: null,
        name: '거절된 사용자',
        loginAttemptCount: 0,
        lockedUntil: null,
      });

      expect(result.status).toBe(UserStatusEnum.INACTIVE);
      expect(result.approvalStatus).toBe(UserApprovalStatusEnum.REJECTED);

      jest.useRealTimers();
    });

    it('가입자를 찾지 못하면 승인/거절 모두 NotFoundException을 던진다', async () => {
      userRepository.findById.mockResolvedValue(null);

      const approveUseCase = new ApproveRegistrationUseCase(userRepository);
      const rejectUseCase = new RejectRegistrationUseCase(
        userRepository,
        rejectionRepository,
        phoneEncryptionService
      );

      await expect(approveUseCase.execute('missing', 'admin')).rejects.toBeInstanceOf(
        NotFoundException
      );
      await expect(rejectUseCase.execute('missing', 'admin')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
