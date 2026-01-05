import styled from '@emotion/styled';

export const HiddenFileInput = styled.input`
  display: none;
`;
export const ContentBoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 48px;
  flex-shrink: 0;
`;
export const BackButton = styled.button`
  font-size: 20px;
  color: #727171;
  font-weight: 500;
  line-height: 130%;
`;
export const EditorBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 16px 36px 0 36px;
`;
export const ImageButtonGroup = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  width: 100%;
  padding: 14px 0 28px 0;

  & .file-upload-warning {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: 16px;
    color: #666;
  }
  & .file-error-text {
    position: absolute;
    bottom: 4px;
    left: 0;
    color: #ce2e36;
    font-size: 14px;
  }
`;
export const ImageButton = styled.button`
  color: #727171;
  background: rgba(114, 113, 113, 0.1);
  border: 1px solid rgba(114, 113, 113, 0.5);
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition:
    background 0.2s,
    border-color 0.2s;

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    background: rgba(114, 113, 113, 0.15);
    border: 1px solid #727171;
  }
`;

export const FileList = styled.ul`
  width: calc(100% - 100px);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0;
  list-style: none;
`;

export const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;

  & > span {
    font-size: 14px;
    color: #333;
    &.file-name {
      width: 100%;
      max-width: 172px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }
    &.file-extension {
      color: #666;
    }
  }

  & > button {
    color: #ce2e36;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
  }
`;
