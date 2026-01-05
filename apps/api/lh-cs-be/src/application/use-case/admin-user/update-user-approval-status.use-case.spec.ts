import { BadRequestException } from '@nestjs/common';
import { UpdateUserApprovalStatusUseCase } from './update-user-approval-status.use-case';
import { ApproveRegistrationUseCase } from '../admin-user/approve-registration.use-case';
import { RejectRegistrationUseCase } from '../admin-user/reject-registration.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  UserApprovalStatusEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

describe('UpdateUserApprovalStatusUseCase', () => {
  let useCase: UpdateUserApprovalStatusUseCase;
  let approveUseCase: jest.Mocked<ApproveRegistrationUseCase>;
  let rejectUseCase: jest.Mocked<RejectRegistrationUseCase>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    approveUseCase = { execute: jest.fn() } as any;
    rejectUseCase = { execute: jest.fn() } as any;
    userRepository = { update: jest.fn() } as any;

    useCase = new UpdateUserApprovalStatusUseCase(
      approveUseCase,
      rejectUseCase,
      userRepository
    );
  });

  it('승인 상태로 변경하면 승인 유스케이스를 실행한다', async () => {
    approveUseCase.execute.mockResolvedValue({ id: 'user-1' } as any);

    const result = await useCase.execute(
      'user-1',
      UserApprovalStatusEnum.APPROVED,
      'admin-1'
    );

    expect(approveUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'admin-1'
    );
    expect(result).toEqual({ id: 'user-1' });
  });

  it('거절 상태로 변경하면 거절 유스케이스를 실행한다', async () => {
    rejectUseCase.execute.mockResolvedValue({ id: 'user-1' } as any);

    const result = await useCase.execute(
      'user-1',
      UserApprovalStatusEnum.REJECTED,
      'admin',
      '사유'
    );

    expect(rejectUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'admin',
      '사유'
    );
    expect(result).toEqual({ id: 'user-1' });
  });

  it('거절 처리자 정보가 없으면 예외를 던진다', async () => {
    await expect(
      useCase.execute('user-1', UserApprovalStatusEnum.REJECTED)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('승인 처리자 정보가 없으면 예외를 던진다', async () => {
    await expect(
      useCase.execute('user-1', UserApprovalStatusEnum.APPROVED)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('기타 상태는 보류 상태로 업데이트한다', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    jest.useFakeTimers().setSystemTime(now);

    userRepository.update.mockResolvedValue({
      id: 'user-1',
      approvalStatus: UserApprovalStatusEnum.PENDING,
      status: UserStatusEnum.INACTIVE,
    } as any);

    const result = await useCase.execute(
      'user-1',
      UserApprovalStatusEnum.PENDING
    );

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      approvalStatus: UserApprovalStatusEnum.PENDING,
      status: UserStatusEnum.INACTIVE,
      inactiveAt: now,
      approvalCompletedAt: null,
      approvalCompletedByUserId: null,
    });
    expect(result.approvalStatus).toBe(UserApprovalStatusEnum.PENDING);

    jest.useRealTimers();
  });

  it('보류 업데이트 실패 시 예외를 던진다', async () => {
    userRepository.update.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', UserApprovalStatusEnum.PENDING)
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
