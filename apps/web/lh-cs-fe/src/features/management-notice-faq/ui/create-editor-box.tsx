import { ManageContentHeader } from '@/features/management/manage-content-header';
import {
  EditorBox,
  ImageButton,
  ImageButtonGroup,
  FileList,
  FileItem,
} from '../style/board-style';
import { CircleLineXIcon, RadioInput } from '@/shared/ui';
import { CommonTextField } from '@/shared/ui/input/input.styles';
import { TextEditor } from './text-editor';
import { BoardFormData } from './create-board-content-box';
import { PUBLIC_STATUS_OPTIONS } from '@/features/management/model/radio-options';

interface ContentEditorBoxProps {
  title: string;
  formData: BoardFormData;
  handleRadioChange: (fieldName: string, value: boolean) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContentChange: (value: string) => void;
  handleFileUpload: () => void;
  handleFileRemove: (fileId: string) => void;
  // fileExtension?: string;
  isSubmitting: boolean;
  lastValidationError: string | null;
}

const maxFileSize = import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB;
export const CreateEditorBox = ({
  title,
  formData,
  handleRadioChange,
  handleTitleChange,
  handleContentChange,
  handleFileUpload,
  handleFileRemove,
  // fileExtension,
  isSubmitting,
  lastValidationError,
}: ContentEditorBoxProps) => {
  return (
    <EditorBox>
      <div
        className='flex items-center justify-between'
        style={{ flexShrink: 0 }}
      >
        <ManageContentHeader title={title} />
        <RadioInput<boolean>
          fieldName='isPublic'
          value={formData.isPublic}
          options={PUBLIC_STATUS_OPTIONS}
          onChange={handleRadioChange}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ flexShrink: 0 }}>
        <CommonTextField
          id='title'
          variant='standard'
          placeholder='제목을 입력해 주세요.'
          padding='18px 0 6px 0'
          value={formData.title}
          onChange={handleTitleChange}
          disabled={isSubmitting}
        />
      </div>
      <ImageButtonGroup>
        <ImageButton onClick={() => handleFileUpload()}>파일 첨부</ImageButton>
        {/* ✅ 업로드된 파일 목록 */}
        {formData.attachments && formData.attachments.length > 0 ? (
          <FileList>
            {formData.attachments.map((item) => {
              const file = item.file;
              const fileId = item.id;
              //file 확장자 추출
              let fileExtension = '';
              if (file) {
                const filterType = file.type.split('/')[1];
                fileExtension = filterType;
              }
              return (
                <FileItem key={`file-item-${fileId}`}>
                  <span className='file-name'>{file.name}</span>
                  <span className='file-extension'>{fileExtension || ''}</span>
                  <button onClick={() => handleFileRemove(fileId)}>
                    <CircleLineXIcon fill={'#333'} />
                  </button>
                </FileItem>
              );
            })}
          </FileList>
        ) : (
          <span className='file-upload-warning'>
            ※ {maxFileSize}MB 이하 파일만 첨부할 수 있습니다.
          </span>
        )}
        {lastValidationError !== null && (
          <span className='file-error-text'>{`${lastValidationError}`}</span>
        )}
      </ImageButtonGroup>
      <TextEditor
        value={formData.content}
        onChange={handleContentChange}
        placeholder='내용을 입력해 주세요.'
        readOnly={isSubmitting}
      />
    </EditorBox>
  );
};
