import {
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { AdminUserFilters } from '@/shared/model/admin-users.dto';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useQueryClient } from '@tanstack/react-query';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';

import {
  ADMIN_USERS_QUERY_KEY,
  useAdminUsersApprovalList,
  useUpdateAdminUserApproval,
} from '@/shared/api/hooks/admin-users-hooks';
import { ManageContentHeader } from '@/features';
import {
  ApprovalModal,
  BASE_FONT_FAMILY,
  Button,
  TabBox,
  TabButton,
} from '@/shared/ui';
import {
  CustomContentCell,
  CustomTableCell,
  CustomTableContainerWithFilter,
  CustomTableRow,
} from '@/features/management/style/table-style';
import { PaginationBox } from '@/features/notice-faq-list/ui/pagination-box';
import { Pagination } from '@/shared/types/common.types';
import { SearchFormDataType } from '@/features/user-search/model/search-types';
import { validateForm } from '@/features/user-search/hooks/use-search-validate';
import { SearchBox } from '@/features/user-search/ui/search-box';

const DEFAULT_FILTERS: AdminUserFilters = {
  page: 1,
  limit: 20,
  orderDirection: 'DESC',
  state: UserApprovalStatusEnum.PENDING,
};
const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const UsersApprovalPage = () => {
  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS);
  const [searchForm, setSearchForm] = useState<SearchFormDataType>({
    username: '',
    name: '',
    department: '',
  });
  const [searchFormErrors, setSearchFormErrors] = useState<
    Record<string, string>
  >({});
  const [paginationData, setPaginationData] =
    useState<Pagination>(DEFAULT_PAGINATION);

  const [currentTab, setCurrentTab] = useState<UserApprovalStatusEnum>(
    UserApprovalStatusEnum.PENDING
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [approvalStatus, setApprovalStatus] = useState<UserApprovalStatusEnum>(
    UserApprovalStatusEnum.PENDING
  );
  const toast = useToastMessages();
  const queryClient = useQueryClient();

  const { data: approvalList, isLoading } = useAdminUsersApprovalList(filters);

  const updateApprovalMutation = useUpdateAdminUserApproval();

  // ✅ 페이지네이션 데이터 동기화
  useEffect(() => {
    if (approvalList?.pagination) {
      setPaginationData(approvalList.pagination);
    }
  }, [approvalList?.pagination]);

  // ✅ 탭 변경 시 필터 업데이트
  const handleTabChange = (approvalState: UserApprovalStatusEnum) => {
    setCurrentTab(approvalState);
    setFilters((prev) => ({
      ...prev,
      state: approvalState,
      page: 1, // 탭 변경 시 첫 페이지로 이동
    }));
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

  // ✅ 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const refetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
  };

  const handleUpdateApproval = async () => {
    setIsApprovalModalOpen(true);

    if (approvalStatus === null) return;

    try {
      await updateApprovalMutation.mutateAsync({
        id: targetUserId,
        payload: { approvalStatus },
      });
      setIsApprovalModalOpen(false);
      const successMessage =
        approvalStatus === UserApprovalStatusEnum.APPROVED
          ? '사용자 가입을 승인했습니다.'
          : approvalStatus === UserApprovalStatusEnum.REJECTED
            ? '사용자 가입을 거절했습니다.'
            : '승인 상태를 변경했습니다.';
      toast.showSuccess(successMessage);
      refetchUsers();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '사용자 승인 상태 변경에 실패했습니다.';
      toast.showError(message);
      setIsApprovalModalOpen(false);
    }
  };

  const users = useMemo(() => approvalList?.items ?? [], [approvalList?.items]);

  // 테이블 헤더에 colgroup으로 너비 정의
  const TableWithFixedColumns = () => (
    <>
      <colgroup>
        <col style={{ width: '12%' }} /> {/* 아이디 */}
        <col style={{ width: '12%' }} />
        <col style={{ width: '21%' }} /> {/* 부서 */}
        <col style={{ width: '21%' }} />
        <col style={{ width: '21%' }} /> {/* 가입 날짜 */}
        {/* 가입 여부 */}
        {currentTab === UserApprovalStatusEnum.PENDING && (
          <col style={{ width: '13%' }} />
        )}
      </colgroup>
      <TableHead sx={{ backgroundColor: '#eee' }}>
        <CustomTableRow className='table-row-header'>
          <CustomTableCell>아이디</CustomTableCell>
          {currentTab === UserApprovalStatusEnum.PENDING && (
            <CustomTableCell>이름</CustomTableCell>
          )}
          <CustomTableCell>부서</CustomTableCell>
          {currentTab === UserApprovalStatusEnum.PENDING && (
            <CustomTableCell>전화번호</CustomTableCell>
          )}
          <CustomTableCell>
            {currentTab === UserApprovalStatusEnum.PENDING
              ? '가입 날짜'
              : '가입 신청 날짜'}
          </CustomTableCell>

          {currentTab === UserApprovalStatusEnum.APPROVED ? (
            <CustomTableCell>승인 날짜</CustomTableCell>
          ) : currentTab === UserApprovalStatusEnum.REJECTED ? (
            <CustomTableCell>거절 날짜</CustomTableCell>
          ) : null}
          {currentTab === UserApprovalStatusEnum.PENDING ? (
            <CustomTableCell>가입 여부</CustomTableCell>
          ) : (
            <CustomTableCell>담당자</CustomTableCell>
          )}
        </CustomTableRow>
      </TableHead>
    </>
  );
  return (
    <>
      <Stack spacing={3} sx={{ height: '100%' }}>
        <ManageContentHeader title={'회원가입 승인 리스트'} />

        <SearchBox
          searchForm={searchForm}
          searchFormErrors={searchFormErrors}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleSearch={handleSearch}
          handleReset={handleReset}
          fields={['username', 'department']}
        />

        <CustomTableContainerWithFilter>
          <TabBox>
            <TabButton
              label='승인 대기'
              className='!h-[60px] !px-[24px] !py-0'
              isActive={currentTab === UserApprovalStatusEnum.PENDING}
              onTabChange={() =>
                handleTabChange(UserApprovalStatusEnum.PENDING)
              }
            />
            <TabButton
              label='승인 완료'
              className='!h-[60px] !px-[24px] !py-0'
              isActive={currentTab === UserApprovalStatusEnum.APPROVED}
              onTabChange={() =>
                handleTabChange(UserApprovalStatusEnum.APPROVED)
              }
            />
            <TabButton
              label='승인 거절'
              className='!h-[60px] !px-[24px] !py-0'
              isActive={currentTab === UserApprovalStatusEnum.REJECTED}
              onTabChange={() =>
                handleTabChange(UserApprovalStatusEnum.REJECTED)
              }
            />
          </TabBox>
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
                  <TableCell
                    colSpan={8}
                    align='center'
                    sx={{ fontFamily: BASE_FONT_FAMILY }}
                  >
                    <>
                      {currentTab === UserApprovalStatusEnum.PENDING
                        ? '승인 대기'
                        : currentTab === UserApprovalStatusEnum.APPROVED
                          ? '승인 완료'
                          : '승인 거절'}
                    </>{' '}
                    사용자가 없습니다.
                  </TableCell>
                </CustomTableRow>
              ) : (
                users.map((user) => {
                  // const isLocked =
                  //   !!user.lockedUntil &&
                  //   new Date(user.lockedUntil) > new Date();
                  return (
                    <CustomTableRow key={user.userId} hover>
                      <CustomContentCell>
                        {user.username || '-'}
                      </CustomContentCell>
                      {currentTab === UserApprovalStatusEnum.PENDING && (
                        <CustomContentCell>{user.name}</CustomContentCell>
                      )}
                      <CustomContentCell>
                        {user.department ? <>{user.department}</> : <>-</>}
                      </CustomContentCell>
                      {currentTab === UserApprovalStatusEnum.PENDING && (
                        <CustomContentCell>
                          {user.phoneNumber ? <>{user.phoneNumber}</> : <>-</>}
                        </CustomContentCell>
                      )}
                      <CustomContentCell>
                        {user.signedAt
                          ? new Date(user.signedAt).toLocaleString()
                          : '-'}
                      </CustomContentCell>
                      {currentTab !== UserApprovalStatusEnum.PENDING && (
                        <CustomContentCell>
                          <>
                            {user.approvedAt ? (
                              <>{new Date(user.approvedAt).toLocaleString()}</>
                            ) : user.rejectedAt ? (
                              <>{new Date(user.rejectedAt).toLocaleString()}</>
                            ) : (
                              '-'
                            )}
                          </>
                        </CustomContentCell>
                      )}

                      {currentTab === UserApprovalStatusEnum.PENDING && (
                        <CustomContentCell align='right'>
                          <Stack
                            direction='row'
                            spacing={1}
                            justifyContent='flex-end'
                          >
                            <Button
                              size='sm'
                              variant='outlinePrimary'
                              onClick={() => {
                                setIsApprovalModalOpen(true);
                                setTargetUserId(user.userId);
                                setApprovalStatus(
                                  UserApprovalStatusEnum.APPROVED
                                );
                              }}
                            >
                              승인
                            </Button>
                            <Button
                              size='sm'
                              variant='outlineError'
                              onClick={() => {
                                setIsApprovalModalOpen(true);
                                setTargetUserId(user.userId);
                                setApprovalStatus(
                                  UserApprovalStatusEnum.REJECTED
                                );
                              }}
                            >
                              거절
                            </Button>
                          </Stack>
                        </CustomContentCell>
                      )}
                      {currentTab !== UserApprovalStatusEnum.PENDING && (
                        <CustomContentCell>
                          <>
                            {user.approvedBy ? (
                              <>{user.approvedBy}</>
                            ) : user.rejectedBy ? (
                              <>{user.rejectedBy}</>
                            ) : (
                              '-'
                            )}
                          </>
                        </CustomContentCell>
                      )}
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
          onPageChange={(event) => handlePageChange(event)}
        />
      </Stack>
      <ApprovalModal
        open={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={() => handleUpdateApproval()}
        approvalStatus={approvalStatus!}
      />
    </>
  );
};

export default UsersApprovalPage;
