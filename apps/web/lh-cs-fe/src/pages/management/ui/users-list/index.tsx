import {
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import {
  AdminUserFilters,
  TotalUserSummary,
} from '@/shared/model/admin-users.dto';

import { useAdminUsers } from '@/shared/api/hooks/admin-users-hooks';
import { ManageContentHeader, UserInfoEditModal } from '@/features';
import { BASE_FONT_FAMILY } from '@/shared/ui';
import {
  CustomContentCell,
  CustomTableCell,
  CustomTableContainerWithFilter,
  CustomTableRow,
} from '@/features/management/style/table-style';
import { PaginationBox } from '@/features/notice-faq-list/ui/pagination-box';
import { getRoleLabel } from '@/shared/model/user-role-permissions';
import { Pagination } from '@/shared/types/common.types';
import { UserStatusTag } from '@/features/management/user-status-tag';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';
import { validateForm } from '../../../../features/user-search/hooks/use-search-validate';
import { SearchFormDataType } from '@/features/user-search/model/search-types';
import { SearchBox } from '@/features/user-search/ui/search-box';

const DEFAULT_FILTERS: AdminUserFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  approvalStatuses: [UserApprovalStatusEnum.APPROVED],
};
const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};
const DEFAULT_SUMMARY: TotalUserSummary = {
  activeCount: 0,
  inactiveCount: 0,
  deletedCount: 0,
  lockedCount: 0,
};

const StatusCount = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%; /* 20.8px */
  color: #333;
  & .inactive {
    color: #0055a2;
  }
  & .locked {
    color: #ce2e36;
  }
`;

const UsersListPage = () => {
  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS);
  const [searchForm, setSearchForm] = useState<SearchFormDataType>({
    username: '',
    name: '',
    department: '',
  });
  const [searchFormErrors, setSearchFormErrors] = useState<
    Record<string, string>
  >({});

  const [isUserInfoEditOpen, setIsUserInfoEditOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [paginationData, setPaginationData] =
    useState<Pagination>(DEFAULT_PAGINATION);
  const [totalUserSummary, setTotalUserSummary] =
    useState<TotalUserSummary>(DEFAULT_SUMMARY);
  const { data, isLoading } = useAdminUsers(filters);

  useEffect(() => {
    setPaginationData(data?.pagination || DEFAULT_PAGINATION);
    setTotalUserSummary(data?.summary || DEFAULT_SUMMARY);
  }, [data]);

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  // 페이지 변경 핸들러 (page: number 전달받음)
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const statusTagGenerate = (
    loginLocked: UserLoginLockStatusEnum,
    userStatus: UserStatusEnum,
    inactiveAt: string | null,
    lockedAt: string | null
  ) => {
    if (
      loginLocked === UserLoginLockStatusEnum.UNLOCKED &&
      userStatus === UserStatusEnum.ACTIVE
    )
      return null;

    if (loginLocked === UserLoginLockStatusEnum.LOCKED) {
      if (userStatus === UserStatusEnum.INACTIVE) {
        return {
          status: UserStatusEnum.INACTIVE,
          date: inactiveAt,
        };
      } else {
        return {
          status: UserLoginLockStatusEnum.LOCKED,
          date: lockedAt,
        };
      }
    } else {
      if (userStatus === UserStatusEnum.INACTIVE) {
        return {
          status: UserStatusEnum.INACTIVE,
          date: inactiveAt,
        };
      } else {
        return null;
      }
    }
  };
  const handleSearchFormErrors = (errors: Record<string, string>) => {
    setSearchFormErrors(errors);
  };

  const handleInputChange = (
    field: keyof SearchFormDataType,
    value: string | null
  ) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSearchFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // 검색 버튼 클릭 시 filters 업데이트 → API 자동 호출
  const handleSearch = () => {
    if (!validateForm({ searchForm, handleSearchFormErrors })) {
      return; // 검증 실패 시 즉시 종료
    }

    setFilters((prev) => ({
      ...prev,
      ...searchForm,
      page: 1, // 검색 시 첫 페이지로
    }));
  };

  const handleReset = () => {
    setSearchForm({ username: '', name: '', department: '' });
    setFilters(DEFAULT_FILTERS);
  };

  // 테이블 헤더에 colgroup으로 너비 정의
  const TableWithFixedColumns = () => (
    <>
      <colgroup>
        <col style={{ width: '5%' }} /> {/* No */}
        <col style={{ width: '9%' }} /> {/* 아이디 */}
        <col style={{ width: '10%' }} /> {/* 이름 */}
        <col style={{ width: '21%' }} /> {/* 부서 */}
        <col style={{ width: '21%' }} /> {/* 타입 */}
        <col style={{ width: '21%' }} /> {/* 가입일 */}
        <col style={{ width: '13%' }} /> {/* 계정 상태 */}
      </colgroup>
      <TableHead sx={{ backgroundColor: '#eee' }}>
        <CustomTableRow className='table-row-header'>
          <CustomTableCell>No</CustomTableCell>
          <CustomTableCell>아이디</CustomTableCell>
          <CustomTableCell>이름</CustomTableCell>
          <CustomTableCell>부서</CustomTableCell>
          <CustomTableCell>타입</CustomTableCell>
          <CustomTableCell>가입일</CustomTableCell>
          <CustomTableCell>계정 상태</CustomTableCell>
        </CustomTableRow>
      </TableHead>
    </>
  );

  return (
    <>
      <Stack spacing={3} sx={{ height: '100%' }}>
        <div className='flex items-center justify-between gap-3'>
          <ManageContentHeader
            title={'회원 리스트'}
            count={paginationData.total}
          />
          <StatusCount>
            <span>
              사용 중: <b>{totalUserSummary.activeCount}명</b>
            </span>
            <span className='px-3 text-[#999]'>|</span>
            <span className='inactive'>
              계정 중지: <b>{totalUserSummary.inactiveCount}명</b>
            </span>
            <span className='px-3 text-[#999]'>|</span>
            <span className='locked'>
              로그인 차단: <b>{totalUserSummary.lockedCount}명</b>
            </span>
          </StatusCount>
        </div>

        <SearchBox
          searchForm={searchForm}
          searchFormErrors={searchFormErrors}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleSearch={handleSearch}
          handleReset={handleReset}
        />

        <CustomTableContainerWithFilter>
          <Table size='small'>
            {TableWithFixedColumns()}

            <TableBody>
              {isLoading ? (
                <CustomTableRow>
                  <TableCell colSpan={8} align='center'>
                    <CircularProgress size={32} />
                  </TableCell>
                </CustomTableRow>
              ) : users.length === 0 ? (
                <CustomTableRow>
                  <TableCell colSpan={8} align='center'>
                    등록된 사용자가 없습니다.
                  </TableCell>
                </CustomTableRow>
              ) : (
                users.map((user, idx) => {
                  // 순번 계산: (현재 페이지 - 1) × limit + idx + 1
                  const rowNumber =
                    (paginationData.page - 1) * paginationData.limit + idx + 1;
                  return (
                    <CustomTableRow
                      key={user.id}
                      hover
                      onClick={() => {
                        setIsUserInfoEditOpen(true);
                        setTargetUserId(user.id);
                      }}
                    >
                      <CustomContentCell>
                        {rowNumber < 10 ? `0${rowNumber}` : `${rowNumber}`}
                      </CustomContentCell>
                      <CustomContentCell>{user.username}</CustomContentCell>
                      <CustomContentCell>{user.name}</CustomContentCell>
                      <CustomContentCell>
                        {user.department ? <>{user.department}</> : <>-</>}
                      </CustomContentCell>
                      <CustomContentCell>
                        {getRoleLabel(user.role)}
                      </CustomContentCell>
                      <CustomContentCell>
                        {user.signedAt
                          ? new Date(user.signedAt).toLocaleString()
                          : '-'}
                      </CustomContentCell>
                      <CustomContentCell>
                        <UserStatusTag
                          badgeData={statusTagGenerate(
                            user.lockStatus,
                            user.status,
                            user.inactiveAt,
                            user.lockAt
                          )}
                        />
                      </CustomContentCell>
                    </CustomTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CustomTableContainerWithFilter>

        <PaginationBox
          currentPage={filters.page!}
          totalPages={paginationData.totalPages}
          limit={paginationData.limit}
          onPageChange={handlePageChange}
        />
      </Stack>

      <UserInfoEditModal
        targetId={targetUserId}
        isOpen={isUserInfoEditOpen}
        onClose={() => setIsUserInfoEditOpen(false)}
      />
    </>
  );
};

export default UsersListPage;
