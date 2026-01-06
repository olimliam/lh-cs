import { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import { MarkerOptionPDF } from '../../types/tour';

import PDFListPopup from './pdf-list-popup';

const FileEmbedWrapper = styled.div<{ isListOpen?: boolean }>`
  @keyframes embedShrink {
    0% {
      width: calc(100% - 30px);
    }
    100% {
      width: calc(100% - 400px);
    }
  }

  @keyframes embedGrow {
    0% {
      width: calc(100% - 400px);
    }
    100% {
      width: calc(100% - 30px);
    }
  }

  ${(props) =>
    props.isListOpen
      ? `
      animation: embedShrink 0.2s;
      width: calc(100% - 400px);
      `
      : `
      animation: embedGrow 0.2s;
      width: calc(100% - 30px);
      `}
`;

const FileListWrapper = styled.div<{ isListOpen?: boolean }>`
  @keyframes listOpen {
    0% {
      transform: translateX(370px);
    }
    100% {
      transform: translateX(0px);
    }
  }

  @keyframes listClose {
    0% {
      transform: translateX(0px);
    }
    100% {
      transform: translateX(370px);
    }
  }

  width: 400px;
  height: 100%;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  ${(props) =>
    props.isListOpen
      ? 'animation: listOpen 0.2s'
      : `
    animation: listClose 0.2s;
    transform: translateX(370px);
    padding-left: 10px;
  `}
`;

const ListItem = styled.div<{ selected?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;

  &:hover {
    color: white;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
  }

  ${(props) =>
    props.selected &&
    `
    color: white;
    font-weight: 500;
  `}
`;

const ListButton = styled.button`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

function PDFContent(props: {
  option: MarkerOptionPDF;
  isListOpen?: boolean;
  onCloseList?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isListOpen, setIsListOpen] = useState<boolean>(
    props.isListOpen || false
  );

  // 임시 message 함수
  const message = (key: string) => key;
  // 임시 device 체크
  const isTablet = false;

  const pdfViewerUrl = (url: string) =>
    'https://docs.google.com/gview?url=' + url + '&embedded=true';

  const handleOpenClick = () => {
    setIsListOpen((prev) => !prev);
  };

  useEffect(() => {
    // 모바일의 경우 상위와 동기화
    setIsListOpen(props.isListOpen || false);
  }, [props.isListOpen]);

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {isTablet ? (
        <>
          <iframe
            style={{ width: '100%', height: '100%' }}
            src={pdfViewerUrl(props.option.pdfs[activeIndex].url)}
          />
          {isListOpen && (
            <PDFListPopup onClose={props.onCloseList}>
              {props.option.pdfs.map((pdf, idx) => {
                return (
                  <ListItem
                    key={idx}
                    selected={idx === activeIndex}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pdf.fileName}
                    </span>
                  </ListItem>
                );
              })}
            </PDFListPopup>
          )}
        </>
      ) : (
        <>
          <FileEmbedWrapper isListOpen={isListOpen}>
            <embed
              type='application/pdf'
              width='100%'
              height='100%'
              src={props.option.pdfs[activeIndex].url}
            />
          </FileEmbedWrapper>
          <FileListWrapper isListOpen={isListOpen}>
            <p
              style={{
                padding: '24px 20px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 500,
              }}
            >
              {message('목차')}
            </p>
            {props.option.pdfs.map((pdf, idx) => {
              return (
                <ListItem
                  key={idx}
                  selected={idx === activeIndex}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pdf.fileName}
                  </span>
                </ListItem>
              );
            })}
            <ListButton onClick={handleOpenClick}>
              <i
                className={
                  isListOpen ? 'ic-arrow-right-double' : 'ic-arrow-left-double'
                }
              />
            </ListButton>
          </FileListWrapper>
        </>
      )}
    </div>
  );
}

export default PDFContent;
