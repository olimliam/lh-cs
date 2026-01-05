import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApproveRegistrationUseCase } from './approve-registration.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  UserApprovalStatusEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

describe('ApproveRegistrationUseCase', () => {
  let useCase: ApproveRegistrationUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const pendingUser: any = {
    id: 'user-1',
    approvalStatus: UserApprovalStatusEnum.PENDING,
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new ApproveRegistrationUseCase(userRepository);
  });

  it('가입 대기 사용자를 승인한다', async () => {
    const approvedUser = {
      ...pendingUser,
      approvalStatus: UserApprovalStatusEnum.APPROVED,
      status: UserStatusEnum.ACTIVE,
    };
    userRepository.findById.mockResolvedValue(pendingUser);
    userRepository.update.mockResolvedValue(approvedUser as any);

    const result = await useCase.execute('user-1', 'admin-1');

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      approvalStatus: UserApprovalStatusEnum.APPROVED,
      status: UserStatusEnum.ACTIVE,
      lockedUntil: null,
      loginAttemptCount: 0,
      approvalCompletedAt: expect.any(Date),
      approvalCompletedByUserId: 'admin-1',
      inactiveAt: null,
    });
    expect(result).toBe(approvedUser);
  });

  it('사용자를 찾을 수 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing', 'admin-1')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('이미 승인된 사용자는 그대로 반환한다', async () => {
    const approved = {
      ...pendingUser,
      approvalStatus: UserApprovalStatusEnum.APPROVED,
    };
    userRepository.findById.mockResolvedValue(approved);

    const result = await useCase.execute('user-1', 'admin-1');

    expect(result).toBe(approved);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('대기 상태가 아니면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue({
      ...pendingUser,
      approvalStatus: UserApprovalStatusEnum.REJECTED,
    });

    await expect(useCase.execute('user-1', 'admin-1')).rejects.toBeInstanceOf(
      ConflictException
    );
  });
});
