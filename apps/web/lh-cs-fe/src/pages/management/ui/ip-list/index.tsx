import { Stack } from '@mui/material';
import { ManageContentHeader } from '@/features';
import { Button, PencilIcon } from '@/shared/ui';
import { PaginationBox } from '@/features/notice-faq-list/ui/pagination-box';
import { Pagination } from '@/shared/types/common.types';
import { useDeleteIp, useGetIp } from '@/features/ip-list/hooks/ip-list-hooks';
import { IpListTable } from '@/features/ip-list/ui/ip-list-table';
import { useState, useEffect } from 'react';
import { IpCreateModal } from '@/features/ip-list/ui/ip-create-modal';
import { IpDeleteModal } from '@/features/ip-list/ui/ip-delete-modal';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { GetPaginationFilterParams } from '@/shared/model/notice-faq-type';

const DEFAULT_FILTERS: GetPaginationFilterParams = {
  page: 1,
  limit: 10,
  orderBy: 'createdAt',
  orderDirection: 'ASC',
};
const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const IpListPage = () => {
  const toast = useToastMessages();
  const [filters, setFilters] =
    useState<GetPaginationFilterParams>(DEFAULT_FILTERS);
  const [paginationData, setPaginationData] =
    useState<Pagination>(DEFAULT_PAGINATION);

  const [isCreateBoxOpen, setIsCreateBoxOpen] = useState(false);

  const { data: ipListData, isLoading: isLoading } = useGetIp(filters);
  const { mutate: deleteIp } = useDeleteIp();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<string>('');

  // ✅ 페이지네이션 데이터 동기화
  useEffect(() => {
    if (ipListData) {
      const newPagination: Pagination = {
        page: ipListData.page,
        limit: ipListData.limit,
        total: ipListData.total,
        totalPages: ipListData.totalPages,
      };
      setPaginationData(newPagination);
    }
  }, [ipListData]);

  // ✅ 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleRemoveIp = (id: string) => {
    // ID를 전달해서 삭제
    deleteIp(id, {
      onSuccess: () => {
        toast.showSuccess('IP가 삭제되었습니다.');
      },
      onError: (error) => {
        toast.showError(error.message);
      },
    });
  };

  return (
    <>
      <Stack spacing={3} sx={{ height: '100%' }}>
        <div className='flex items-center justify-between'>
          <ManageContentHeader title={'접속 IP 관리'} />
          <Button
            size={'md'}
            variant='primary'
            onClick={() => setIsCreateBoxOpen(true)}
          >
            <PencilIcon />
            <span className='ml-2'>IP 등록하기</span>
          </Button>
        </div>

        <IpListTable
          ipListData={ipListData?.data || []}
          isLoading={isLoading}
          handleIsDeleteModalOpen={() => setIsDeleteModalOpen(true)}
          handleSetTargetId={(id: string) => setTargetId(id)}
        />

        <PaginationBox
          currentPage={filters.page!}
          totalPages={paginationData.totalPages}
          limit={paginationData.limit}
          onPageChange={(event) => handlePageChange(event)}
        />
      </Stack>

      <IpCreateModal
        isOpen={isCreateBoxOpen}
        onClose={() => setIsCreateBoxOpen(false)}
      />

      <IpDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          handleRemoveIp(targetId);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
};

export default IpListPage;
