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
import { GetPaginationFilterParams } from '@/shared/model/notice-faq-type';
import { usePublicQna } from '@/shared/api/hooks/qna-hooks';
import CreateQnaContentBox from '@/features/management-notice-faq/ui/create-qna-content-box';
import UpdateQnaContentBox from '@/features/management-notice-faq/ui/update-qna-content-box';

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

const ManageQnaPage = () => {
  const [filters, setFilters] =
    useState<GetPaginationFilterParams>(DEFAULT_FILTERS);
  const [paginationData, setPaginationData] =
    useState<Pagination>(DEFAULT_PAGINATION);

  const [isCreateBoxOpen, setIsCreateBoxOpen] = useState(false);
  const [isUpdateBoxOpen, setIsUpdateBoxOpen] = useState(false);
  const [targetId, setTargetId] = useState<string>('');
  // const toast = useToastMessages();
  // const queryClient = useQueryClient();

  const {
    data: faqData,
    isLoading: isLoading,
    // error: noticeError,
  } = usePublicQna(filters);

  // ✅ 페이지네이션 데이터 동기화
  useEffect(() => {
    if (faqData?.data) {
      const newPagination: Pagination = {
        page: faqData?.data.page,
        limit: faqData?.data.limit,
        total: faqData?.data.total,
        totalPages: faqData?.data.totalPages,
      };
      setPaginationData(newPagination);
    }
  }, [faqData]);

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
            <ManageContentHeader title={'자주 묻는 질문 리스트'} />
            <Button
              size={'md'}
              variant='primary'
              onClick={() => setIsCreateBoxOpen(true)}
            >
              <PencilIcon />
              <span className='ml-2'>자주 묻는 질문 추가</span>
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
                ) : faqData?.data.data.length === 0 ? (
                  <CustomTableRow>
                    <TableCell
                      colSpan={8}
                      align='center'
                      sx={{ fontFamily: BASE_FONT_FAMILY }}
                    >
                      게시글이 없습니다.
                    </TableCell>
                  </CustomTableRow>
                ) : (
                  faqData?.data.data.map((faq, idx) => {
                    return (
                      <CustomTableRow
                        key={faq.id}
                        hover
                        onClick={() => handleUpdateOpen(faq.id)}
                      >
                        <CustomContentCell>
                          {idx < 9 ? `0${idx + 1}` : idx + 1}
                        </CustomContentCell>
                        <CustomContentCell>{faq.title}</CustomContentCell>
                        <CustomContentCell>{faq.createdBy}</CustomContentCell>
                        <CustomContentCell>
                          {faq.createdAt
                            ? new Date(faq.createdAt).toLocaleString()
                            : '-'}
                        </CustomContentCell>
                        <CustomContentCell>
                          {faq.isPublic ? (
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
        <CreateQnaContentBox handleUndoPage={() => setIsCreateBoxOpen(false)} />
      )}
      {isUpdateBoxOpen && (
        <UpdateQnaContentBox
          id={targetId}
          handleUndoPage={() => setIsUpdateBoxOpen(false)}
        />
      )}
      {/* <ApprovalModal
        open={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={() => handleUpdateApproval()}
        approvalStatus={approvalStatus!}
      /> */}
    </>
  );
};

export default ManageQnaPage;
