import {
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ManageContentHeader } from '@/features';
import { BASE_FONT_FAMILY, Button, PencilIcon } from '@/shared/ui';
import {
  CustomContentCell,
  CustomTableCell,
  CustomTableContainer,
  CustomTableRow,
} from '@/features/management/style/table-style';
import { PaginationBox } from '@/features/notice-faq-list/ui/pagination-box';
import { Pagination } from '@/shared/types/common.types';
import { usePublicNotices } from '@/shared/api/hooks/notice-hooks';
import { GetPaginationFilterParams } from '@/shared/model/notice-faq-type';
import CreateBoardContentBox from '@/features/management-notice-faq/ui/create-board-content-box';
import UpdateBoardContentBox from '@/features/management-notice-faq/ui/update-board-content-box';

const DEFAULT_FILTERS: GetPaginationFilterParams = {
  page: 1,
  limit: 20,
  orderBy: 'createdAt',
  orderDirection: 'ASC',
  // isPublic: true,
};
const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const ManageNoticePage = () => {
  const [filters, setFilters] =
    useState<GetPaginationFilterParams>(DEFAULT_FILTERS);
  const [paginationData, setPaginationData] =
    useState<Pagination>(DEFAULT_PAGINATION);

  const [isCreateBoxOpen, setIsCreateBoxOpen] = useState(false);
  const [isUpdateBoxOpen, setIsUpdateBoxOpen] = useState(false);
  const [targetId, setTargetId] = useState<string>('');

  const { data: noticeData, isLoading: isLoading } = usePublicNotices(filters);

  // ✅ 페이지네이션 데이터 동기화
  useEffect(() => {
    if (noticeData?.data) {
      const newPagination: Pagination = {
        page: noticeData?.data.page,
        limit: noticeData?.data.limit,
        total: noticeData?.data.total,
        totalPages: noticeData?.data.totalPages,
      };
      setPaginationData(newPagination);
    }
  }, [noticeData]);

  // ✅ 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleUpdateOpen = (id: string) => {
    setTargetId(id);
    setIsUpdateBoxOpen(true);
  };

  // const refetchUsers = () => {
  //   queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
  // };

  // const handleUpdateApproval = async () => {
  //   setIsApprovalModalOpen(true);

  //   if (approvalStatus === null) return;

  //   try {
  //     await updateApprovalMutation.mutateAsync({
  //       id: targetUserId,
  //       payload: { approvalStatus },
  //     });
  //     setIsApprovalModalOpen(false);
  //     const successMessage =
  //       approvalStatus === UserApprovalStatusEnum.APPROVED
  //         ? '사용자 가입을 승인했습니다.'
  //         : approvalStatus === UserApprovalStatusEnum.REJECTED
  //           ? '사용자 가입을 거절했습니다.'
  //           : '승인 상태를 변경했습니다.';
  //     toast.showSuccess(successMessage);
  //     refetchUsers();
  //   } catch (error) {
  //     const message =
  //       error instanceof Error
  //         ? error.message
  //         : '사용자 승인 상태 변경에 실패했습니다.';
  //     toast.showError(message);
  //     setIsApprovalModalOpen(false);
  //   }
  // };

  // const users = useMemo(() => approvalList?.items ?? [], [approvalList?.items]);

  // 테이블 헤더에 colgroup으로 너비 정의
  const TableWithFixedColumns = () => (
    <>
      <colgroup>
        <col style={{ width: '8%' }} />
        <col style={{ width: '54%' }} />
        <col style={{ width: '8%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '10%' }} />
      </colgroup>
      <TableHead sx={{ backgroundColor: '#eee' }}>
        <CustomTableRow className='table-row-header'>
          <CustomTableCell>No</CustomTableCell>
          <CustomTableCell>제목</CustomTableCell>
          <CustomTableCell>작성자</CustomTableCell>
          <CustomTableCell>작성일</CustomTableCell>
          <CustomTableCell>공개 여부</CustomTableCell>
        </CustomTableRow>
      </TableHead>
    </>
  );
  return (
    <>
      {!isCreateBoxOpen && !isUpdateBoxOpen && (
        <Stack spacing={3} sx={{ height: '100%' }}>
          <div className='flex items-center justify-between'>
            <ManageContentHeader title={'공지사항 리스트'} />
            <Button
              size={'md'}
              variant='primary'
              onClick={() => setIsCreateBoxOpen(true)}
            >
              <PencilIcon />
              <span className='ml-2'>공지사항 추가</span>
            </Button>
          </div>

          <CustomTableContainer>
            <Table size='small'>
              {TableWithFixedColumns()}

              <TableBody>
                {isLoading ? (
                  <CustomTableRow>
                    <TableCell colSpan={8} align='center'>
                      <CircularProgress size={32} />
                    </TableCell>
                  </CustomTableRow>
                ) : noticeData?.data.data.length === 0 ? (
                  <CustomTableRow>
                    <TableCell
                      colSpan={8}
                      align='center'
                      sx={{ fontFamily: BASE_FONT_FAMILY }}
                    >
                      공지사항이 없습니다.
                    </TableCell>
                  </CustomTableRow>
                ) : (
                  noticeData?.data.data.map((notice, idx) => {
                    return (
                      <CustomTableRow
                        key={notice.id}
                        hover
                        onClick={() => handleUpdateOpen(notice.id)}
                      >
                        <CustomContentCell>
                          {idx < 9 ? `0${idx + 1}` : idx + 1}
                        </CustomContentCell>
                        <CustomContentCell>{notice.title}</CustomContentCell>
                        <CustomContentCell>
                          {notice.createdBy}
                        </CustomContentCell>
                        <CustomContentCell>
                          {notice.createdAt
                            ? new Date(notice.createdAt).toLocaleString()
                            : '-'}
                        </CustomContentCell>
                        <CustomContentCell>
                          {notice.isPublic ? (
                            <span className='font-bold text-[#0055A2]'>
                              공개
                            </span>
                          ) : (
                            <span className='font-bold text-[#CE2E36]'>
                              비공개
                            </span>
                          )}
                        </CustomContentCell>
                      </CustomTableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CustomTableContainer>

          <PaginationBox
            currentPage={filters.page!}
            totalPages={paginationData.totalPages}
            limit={paginationData.limit}
            onPageChange={(event) => handlePageChange(event)}
          />
        </Stack>
      )}
      {isCreateBoxOpen && (
        <CreateBoardContentBox
          handleUndoPage={() => setIsCreateBoxOpen(false)}
        />
      )}
      {isUpdateBoxOpen && (
        <UpdateBoardContentBox
          id={targetId}
          handleUndoPage={() => setIsUpdateBoxOpen(false)}
        />
      )}
    </>
  );
};

export default ManageNoticePage;
