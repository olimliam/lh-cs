import { DownloadIcon, PdfIcon } from '@/shared/ui';
import styled from '@emotion/styled';
import { ContentRenderer } from './content-renderer';
import { NoticeAttachments } from '@/shared/model/notice-api-type';

// 기존 styled components
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const DownloadBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 10px;
  min-width: 80px;
  transition: all 0.3s ease;
  text-align: left;
  color: #0055a2;
  font-weight: 500;
  font-size: 14px;

  &:hover {
    background-color: rgba(0, 85, 162, 0.1);
  }
`;

const DividerBox = styled.div`
  width: 100%;
  height: 1px;
  background-color: #0055a2;
  margin: 16px 0px;
`;

const MainContentBox = styled.div`
  padding: 16px;
  border-radius: 4px;
  background: #f5f5f5;
  min-height: 344px;

  & p {
    color: #111;
    line-height: 150%; /* 24px */
  }
`;
const TextBox = styled.div`
  padding: 16px;
`;
const FileBox = styled.div`
  display: flex;
  padding: 4px 8px;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #d4e8f8;
  background-color: #f8fcff;

  & span {
    color: #333;
    text-align: left;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 130%; /* 20.8px */
    width: calc(100% - 130px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface ContentProps {
  content: string;
  // fileName?: string | null;
  attachments?: NoticeAttachments[];
}
export const LandingNoticeContent = ({
  content,
  // fileName,
  attachments,
}: ContentProps) => {
  /**
   * URL에서 파일명 추출
   * @example "https://cdn.example.com/notifications/maintenance.pdf" → "maintenance.pdf"
   */
  // const getFileName = (): string => {
  //   // if (fileName && fileName.trim().length > 0) {
  //   //   return fileName;
  //   // }

  //   if (!attachments || attachments.length === 0) return '첨부파일';

  //   try {
  //     const urlObj = new URL(attachments[0].fileUrl);
  //     const pathname = urlObj.pathname;
  //     const fileName = pathname.split('/').pop() || '첨부파일';

  //     // URL 디코딩 (한글 파일명 지원)
  //     return decodeURIComponent(fileName);
  //   } catch (error) {
  //     console.error('❌ Invalid file URL:', error);
  //     return '첨부파일';
  //   }
  // };

  /**
   * 파일 다운로드 핸들러
   * @note CORS 정책에 따라 동작이 달라질 수 있음
   */
  const handleDownload = (fileName?: string, fileUrl?: string) => {
    if (!attachments || attachments.length === 0) {
      console.warn('⚠️ No file URL provided');
      return;
    }

    try {
      // ✅ 방법 1: <a> 태그 동적 생성 (권장)
      const link = document.createElement('a');
      link.href = fileUrl || '';
      link.download = fileName || ''; // 파일명 지정
      link.target = '_blank'; // 새 탭에서 열기 (다운로드 실패 시 대비)

      // DOM에 추가하지 않고 클릭 이벤트 트리거
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('파일 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <MainContent>
      <ContentArea>
        <DividerBox />

        <div id='mainContentBox'>
          <MainContentBox className='landing-notice-content-box'>
            <TextBox>
              {/* ✅ ContentRenderer로 HTML 렌더링 */}
              <ContentRenderer
                htmlString={content}
                className='landing-content-renderer'
              />
            </TextBox>
          </MainContentBox>
        </div>
        <DividerBox />
        {attachments && attachments.length > 0 ? (
          <>
            {attachments.map((item, index) => {
              return (
                <FileBox key={index}>
                  <PdfIcon fill={'#333'} />
                  <span>{item.fileName}</span>
                  <DownloadBtn
                    onClick={() => handleDownload(item.fileName, item.fileUrl)}
                  >
                    <DownloadIcon fill={'#0055A2'} />
                    다운로드
                  </DownloadBtn>
                </FileBox>
              );
            })}
          </>
        ) : null}
      </ContentArea>
    </MainContent>
  );
};
