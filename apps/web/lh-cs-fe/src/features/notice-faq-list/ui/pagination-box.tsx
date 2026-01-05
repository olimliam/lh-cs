import React from 'react';
import { Pagination, PaginationItem } from '@mui/material';
import styled from '@emotion/styled';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import {
  ArrowLeftDoubleIcon,
  ArrowLeftIcon,
  ArrowRightDoubleIcon,
  ArrowRightIcon,
} from '@/shared/ui';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
}

// ✅ 컨테이너 스타일
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

// ✅ 태블릿용 페이지 표시 스타일 (nav 안에서 flex 아이템으로 작동)
const PaginationCurPage = styled.li`
  color: #999;
  text-align: center;
  font-style: normal;
  line-height: 130%;
  letter-spacing: 0.17px;
  padding: 4px 0;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;

  & .point-color {
    color: #0055a2;
  }
`;

// ✅ 커스텀 MUI Pagination 스타일
const StyledPagination = styled(Pagination)`
  .MuiPagination-ul {
    gap: 4px;
  }

  .MuiPaginationItem-root {
    width: 40px;
    height: 40px;
    padding: 8px;
    border: 1px solid #e2e2e2;
    background: #ffffff;
    color: #374151;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 40px;

    &:hover:not(.Mui-disabled) {
      background: rgba(0, 85, 162, 0.1);
      border-color: #e2e2e2;
    }

    &.Mui-selected {
      background: #0055a2;
      color: #ffffff;
      border-color: #0055a2;

      &:hover {
        background: #0055a2;
      }
    }

    &.Mui-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .MuiPaginationItem-icon {
    font-size: 20px;
  }
`;

export const PaginationBox: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  // limit,
}) => {
  const { isTablet } = useDeviceDetector();

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    onPageChange(page);
  };

  // ✅ 태블릿 뷰 - page 첫 번째만 렌더링
  let pageRendered = false;

  if (isTablet) {
    return (
      <PaginationContainer>
        <StyledPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant='outlined'
          shape='rounded'
          showFirstButton
          showLastButton
          siblingCount={0}
          boundaryCount={0}
          renderItem={(item) => {
            // page 타입은 첫 번째만 렌더링
            if (item.type === 'page') {
              if (!pageRendered) {
                pageRendered = true;
                return (
                  <PaginationCurPage>
                    <span>{currentPage}</span>
                    <span className='px-[10px]'>/</span>
                    <span className='point-color'>{totalPages}</span>
                  </PaginationCurPage>
                );
              }
              return null; // 나머지 page는 렌더링 안 함
            }

            // first, previous, next, last 버튼
            return (
              <PaginationItem
                {...item}
                component='button'
                slots={{
                  first: () => <ArrowLeftDoubleIcon fill={'#111111'} />,
                  previous: () => <ArrowLeftIcon fill={'#111111'} />,
                  next: () => <ArrowRightIcon fill={'#111111'} />,
                  last: () => <ArrowRightDoubleIcon fill={'#111111'} />,
                }}
              />
            );
          }}
        />
      </PaginationContainer>
    );
  }

  // ✅ 데스크톱 뷰: 5개씩 표시
  return (
    <PaginationContainer>
      <StyledPagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        variant='outlined'
        shape='rounded'
        showFirstButton
        showLastButton
        siblingCount={2} // ✅ 현재 페이지 + 양쪽 2개 = 총 5개
        boundaryCount={0} // ✅ 시작/끝 페이지 숨김
        renderItem={(item) => (
          <PaginationItem
            {...item}
            component='button'
            slots={{
              first: () => <ArrowLeftDoubleIcon fill={'#111111'} />,
              previous: () => <ArrowLeftIcon fill={'#111111'} />,
              next: () => <ArrowRightIcon fill={'#111111'} />,
              last: () => <ArrowRightDoubleIcon fill={'#111111'} />,
            }}
            aria-label={
              item.type === 'page'
                ? `${item.page} 페이지로 이동`
                : `${item.type} 페이지로 이동`
            }
            aria-current={item.page === currentPage ? 'page' : undefined}
          />
        )}
      />
    </PaginationContainer>
  );
};
