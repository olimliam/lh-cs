import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';
import { TableCell, TableContainer, TableRow } from '@mui/material';

export const CustomTableRow = styled(TableRow)`
  height: 60px;
  &:last-of-type {
    border-bottom: none;
  }
  &.table-row-header {
    height: 46px;
  }
`;
export const CustomTableCell = styled(TableCell)`
  font-family: ${BASE_FONT_FAMILY};
  color: #666;
`;
export const CustomContentCell = styled(TableCell)`
  font-family: ${BASE_FONT_FAMILY};
  color: #333;
  padding: 0;
  height: 100%;
  /* 첫 번째 셀에 왼쪽 패딩 추가 */
  &:first-of-type {
    padding-left: 24px;
  }

  /* 마지막 셀에 오른쪽 패딩 추가 */
  &:last-of-type {
    padding-right: 24px;
  }
`;

export const CustomTableContainer = styled(TableContainer)`
  height: 100%;
  max-height: calc(100% - 140px);
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: '#fafafa';
`;
export const CustomTableContainerWithFilter = styled(TableContainer)`
  height: 100%;
  max-height: calc(100% - 214px);
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: '#fafafa';
`;
