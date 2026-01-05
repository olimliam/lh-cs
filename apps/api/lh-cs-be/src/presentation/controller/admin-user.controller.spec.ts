import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from '../../application/service/admin-user.service';
import { UpdateAdminUserUseCase } from '@/application/use-case/admin-user';
import {
  UserLockStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import {
  AdminApprovalState,
  PendingRegistrationsResult,
  RejectionHistoryResult,
} from '@/application/dto/user/user.dto';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let adminUserService: jest.Mocked<AdminUserService>;
  let updateAdminUserUseCase: jest.Mocked<UpdateAdminUserUseCase>;

  beforeEach(() => {
    adminUserService = {
      getUsersForAdmin: jest.fn(),
      getApprovals: jest.fn(),
      inactivateUser: jest.fn(),
    } as any;

    updateAdminUserUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new AdminUserController(
      adminUserService,
      updateAdminUserUseCase
    );
  });

  it('GET /admin/users 응답 DTO를 스펙에 맞게 매핑한다', async () => {
    const now = new Date('2024-03-10T00:00:00Z');

    adminUserService.getUsersForAdmin.mockResolvedValue({
      users: [
        {
          id: 'u1',
          username: 'tester',
          name: '테스터',
          department: '상담',
          role: UserRoleEnum.ADMIN,
          status: UserStatusEnum.ACTIVE,
          signedAt: now,
          createdAt: now,
          lockState: UserLockStatusEnum.LOCKED,
          lockAt: now,
        },
      ],
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 10,
      summary: {
        activeCount: 1,
        inactiveCount: 0,
        lockedCount: 1,
      },
    } as any);

    const response = await controller.getUsers({ page: 1, limit: 10 } as any);

    expect(adminUserService.getUsersForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 })
    );
    expect(response.success).toBe(true);
    expect(response.data.users[0]).toMatchObject({
      id: 'u1',
      username: 'tester',
      name: '테스터',
      department: '상담',
      role: UserRoleEnum.ADMIN,
      status: UserStatusEnum.ACTIVE,
      signedAt: now,
      lockStatus: UserLockStatusEnum.LOCKED,
      lockAt: now,
    });
    expect(response.data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(response.data.summary).toEqual({
      activeCount: 1,
      inactiveCount: 0,
      lockedCount: 1,
    });
  });

  it('GET /admin/users approvals(PENDING) 응답에 signedAt을 매핑한다', async () => {
    const signedAt = new Date('2024-03-11T00:00:00Z');
    adminUserService.getApprovals.mockResolvedValueOnce({
      items: [
        {
          userId: 'u2',
          username: 'pending-user',
          name: '가입대기',
          department: '상담',
          phoneNumber: '01012345678',
          signedAt,
          approvedAt: null,
          approvedBy: null,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as PendingRegistrationsResult);

    const response = await controller.getApprovals({
      state: AdminApprovalState.PENDING,
      page: 1,
      limit: 10,
    } as any);

    expect(response.data.items[0]).toMatchObject({
      userId: 'u2',
      username: 'pending-user',
      signedAt,
      approvedAt: null,
      approvedBy: null,
    });
    expect((response.data.items[0] as any).requestedAt).toBeUndefined();
  });

  it('GET /admin/users approvals(APPROVED) 응답에 username을 포함한다', async () => {
    const signedAt = new Date('2024-03-11T00:00:00Z');
    const approvedAt = new Date('2024-03-15T00:00:00Z');
    adminUserService.getApprovals.mockResolvedValueOnce({
      items: [
        {
          userId: 'u4',
          username: 'approved-user',
          name: '승인완료',
          department: '운영',
          phoneNumber: '01022223333',
          signedAt,
          approvedAt,
          approvedBy: 'admin-approver',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as PendingRegistrationsResult);

    const response = await controller.getApprovals({
      state: AdminApprovalState.APPROVED,
      page: 1,
      limit: 10,
    } as any);

    expect(response.data.items[0]).toMatchObject({
      userId: 'u4',
      username: 'approved-user',
      signedAt,
      approvedAt,
      approvedBy: 'admin-approver',
    });
  });

  it('GET /admin/users approvals(REJECTED) 응답에 signedAt을 매핑한다', async () => {
    const signedAt = new Date('2024-03-12T00:00:00Z');
    const rejectedAt = new Date('2024-03-13T00:00:00Z');
    adminUserService.getApprovals.mockResolvedValueOnce({
      items: [
        {
          userId: 'u3',
          username: 'rejected-user',
          department: null,
          signedAt,
          rejectedAt,
          rejectedBy: 'admin-user',
          reason: '미비',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } as RejectionHistoryResult);

    const response = await controller.getApprovals({
      state: AdminApprovalState.REJECTED,
      page: 1,
      limit: 10,
    } as any);

    expect(response.data.items[0]).toMatchObject({
      userId: 'u3',
      username: 'rejected-user',
      signedAt,
      rejectedAt,
      rejectedBy: 'admin-user',
      reason: '미비',
    });
    expect((response.data.items[0] as any).requestedAt).toBeUndefined();
  });

  it('POST /admin/users/:id/inactivate 결과를 반환한다', async () => {
    const now = new Date('2024-04-10T00:00:00Z');
    adminUserService.inactivateUser.mockResolvedValueOnce({
      id: '7',
      status: UserStatusEnum.INACTIVE,
      username: 'keep-username',
      name: '중지된 사용자',
      inactiveAt: now,
      updatedAt: now,
    } as any);

    const response = await controller.inactivateUser('7' as any);

    expect(adminUserService.inactivateUser).toHaveBeenCalledWith('7');
    expect(response.data).toMatchObject({
      id: '7',
      status: UserStatusEnum.INACTIVE,
      username: 'keep-username',
      name: '중지된 사용자',
      inactiveAt: now,
      updatedAt: now,
    });
  });
});
