import React, { useState } from 'react';
import styled from '@emotion/styled';

import { media } from '@/shared/utils';
import { PaginationBox } from './pagination-box';
import { NoticeListModal } from './notice-list-modal';
import { usePublicNotices } from '../../../shared/api/hooks/notice-hooks';
import { usePublicQna } from '../../../shared/api/hooks/qna-hooks';
import { dateGenerator } from '../lib/generator.date.util';
import { FaqListModal } from './faq-list-modal';
import { TabBox, TabButton } from '@/shared/ui';

interface NoticeBoxProps {
  className?: string;
}

// Styled Components
const ListBoxContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  padding: 20px 24px;

  ${media.tablet`
    padding: 16px;
  `}
  ${media.fold`
    padding: 12px;
  `}
`;

const ListContent = styled.div``;

const ListWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  min-height: 240px;
  ${media.tablet`
    margin: 12px 0;
    min-height: 176px;
  `};
`;

const ItemContent = styled.p`
  color: #000;
  text-align: left;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;
  width: calc(100% - 90px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${media.tablet`
    font-size: 14px;
  `}
`;
const ItemContainer = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-radius: 4px;
    background: #f9fbff;

    & ${ItemContent} {
      font-weight: 700;
    }
  }

  ${media.tablet`
    height: 44px;
  `}
`;

const ContentDate = styled.span`
  color: #727171;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;
  width: 82px;

  ${media.tablet`
    font-size: 14px;
  `}
`;

const WarningText = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  width: 100%;
  color: #6b7280;
  font-weight: 600;
  font-size: 16px;
`;

// 메인 컴포넌트
export const ListBox: React.FC<NoticeBoxProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'qna'>('notice');
  const [isItemPopupOpen, setIsItemPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ✅ React Query Hook 사용 - 공지사항
  const {
    data: noticeData,
    isLoading: isNoticeLoading,
    error: noticeError,
  } = usePublicNotices({
    page: currentPage,
    limit: 4, // 페이지당 4개 표시
    orderBy: 'createdAt',
    orderDirection: 'DESC',
    isPublic: true,
  });

  // ✅ React Query Hook 사용 - QnA
  const {
    data: qnaData,
    isLoading: isQnaLoading,
    error: qnaError,
  } = usePublicQna({
    page: currentPage,
    limit: 4,
    orderBy: 'createdAt',
    orderDirection: 'DESC',
    isPublic: true,
  });

  /**
   * TODO: 공지사항/qna 개별 아이템 클릭 시 api 호출+데이터 저장+팝업 오픈 처리
   */
  const handleNoticeClick = (noticeId: string) => {
    setIsItemPopupOpen(true);
    setSelectedItemId(noticeId);
  };

  const handleQnaClick = (qnaId: string) => {
    setIsItemPopupOpen(true);
    setSelectedItemId(qnaId);
  };

  // ✅ 현재 활성 탭의 로딩/에러 상태
  const isLoading = activeTab === 'notice' ? isNoticeLoading : isQnaLoading;
  const error = activeTab === 'notice' ? noticeError : qnaError;

  // ✅ 현재 활성 탭의 데이터 (타입 가드 추가)
  const currentData = activeTab === 'notice' ? noticeData?.data : qnaData?.data;

  // ✅ 타입 가드: data가 배열인지 확인
  const currentItems = Array.isArray(currentData?.data) ? currentData.data : [];

  const totalPages = currentData?.totalPages || 1;
  const limit = currentData?.limit || 4;

  return (
    <>
      <ListBoxContainer className={className}>
        <TabBox>
          <TabButton
            label='공지사항'
            isActive={activeTab === 'notice'}
            onTabChange={() => setActiveTab('notice')}
          />
          <TabButton
            label='자주묻는질문'
            isActive={activeTab === 'qna'}
            onTabChange={() => setActiveTab('qna')}
          />
        </TabBox>

        <ListContent>
          {/* ✅ 로딩 상태 */}
          {isLoading && <WarningText>데이터를 불러오는 중...</WarningText>}

          {/* ✅ 에러 상태 */}
          {error && (
            <WarningText>
              데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
            </WarningText>
          )}
          {!isLoading && !error && (
            <>
              {activeTab === 'notice' ? (
                <ListWrapper>
                  {currentItems.length === 0 ? (
                    <WarningText>공지사항이 없습니다.</WarningText>
                  ) : (
                    currentItems?.map((notice) => (
                      <ItemContainer
                        key={notice.id}
                        onClick={() => handleNoticeClick(notice.id)}
                      >
                        <ItemContent>{notice.title}</ItemContent>
                        <ContentDate>
                          {dateGenerator(notice.updatedAt)}
                        </ContentDate>
                      </ItemContainer>
                    ))
                  )}
                </ListWrapper>
              ) : (
                <ListWrapper>
                  {currentItems.length === 0 ? (
                    <WarningText>자주 묻는 질문이 없습니다.</WarningText>
                  ) : (
                    currentItems?.map((qna) => (
                      <ItemContainer
                        key={qna.id}
                        onClick={() => handleQnaClick(qna.id)}
                      >
                        <ItemContent>Q. {qna.title}</ItemContent>
                        <ContentDate>
                          {dateGenerator(qna.updatedAt)}
                        </ContentDate>
                      </ItemContainer>
                    ))
                  )}
                </ListWrapper>
              )}
            </>
          )}

          <PaginationBox
            currentPage={currentPage}
            totalPages={totalPages}
            limit={limit}
            onPageChange={setCurrentPage}
          />
        </ListContent>
      </ListBoxContainer>

      {isItemPopupOpen && (
        <>
          {activeTab === 'notice' ? (
            <NoticeListModal
              isOpen={isItemPopupOpen}
              contentType={activeTab}
              selectedItemId={selectedItemId}
              variant={'primary'}
              onClose={() => {
                setIsItemPopupOpen(false);
              }}
            />
          ) : (
            <FaqListModal
              isOpen={isItemPopupOpen}
              contentType={activeTab}
              selectedItemId={selectedItemId}
              variant={'primary'}
              onClose={() => {
                setIsItemPopupOpen(false);
              }}
            />
          )}
        </>
      )}
    </>
  );
};
