import {
  CustomContentCell,
  CustomTableCell,
  CustomTableContainer,
  CustomTableRow,
} from '@/features/management/style/table-style';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '@mui/material';
import { GetIpListResponse } from '../model/ip-list-type';
import { BASE_FONT_FAMILY, Button } from '@/shared/ui';

interface IpListTableProps {
  ipListData: GetIpListResponse[] | undefined;
  isLoading: boolean;
  handleIsDeleteModalOpen: () => void;
  handleSetTargetId: (id: string) => void;
}

// 테이블 헤더에 colgroup으로 너비 정의
const TableWithFixedColumns = () => (
  <>
    <colgroup>
      <col style={{ width: '23%' }} />
      <col style={{ width: '23%' }} />
      <col style={{ width: '22%' }} />
      <col style={{ width: '22%' }} />
      <col style={{ width: '10%' }} />
    </colgroup>
    <TableHead sx={{ backgroundColor: '#eee' }}>
      <CustomTableRow className='table-row-header'>
        <CustomTableCell>IP 주소</CustomTableCell>
        <CustomTableCell>명칭</CustomTableCell>
        <CustomTableCell>등록일</CustomTableCell>
        <CustomTableCell>등록 관리자</CustomTableCell>
        <CustomTableCell>사용 여부</CustomTableCell>
      </CustomTableRow>
    </TableHead>
  </>
);

export const IpListTable = ({
  ipListData,
  isLoading,
  handleIsDeleteModalOpen,
  handleSetTargetId,
}: IpListTableProps) => {
  return (
    <>
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
            ) : ipListData?.length === 0 ? (
              <CustomTableRow>
                <TableCell
                  colSpan={8}
                  align='center'
                  sx={{ fontFamily: BASE_FONT_FAMILY }}
                >
                  관리할 IP가 없습니다.
                </TableCell>
              </CustomTableRow>
            ) : (
              ipListData?.map((item) => {
                return (
                  <CustomTableRow key={item.id} hover>
                    <CustomContentCell>{item.ipAddress}</CustomContentCell>
                    <CustomContentCell>{item.description}</CustomContentCell>
                    <CustomContentCell>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : '-'}
                    </CustomContentCell>
                    <CustomContentCell>
                      {item.createdBy || '-'}
                    </CustomContentCell>
                    <CustomContentCell>
                      <Button
                        size='sm'
                        variant='outlineError'
                        onClick={() => {
                          handleIsDeleteModalOpen();
                          handleSetTargetId(item.id);
                        }}
                      >
                        삭제
                      </Button>
                    </CustomContentCell>
                  </CustomTableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CustomTableContainer>
    </>
  );
};
