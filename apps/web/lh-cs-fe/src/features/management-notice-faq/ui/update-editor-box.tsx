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
import { PUBLIC_STATUS_OPTIONS } from '@/features/management/model/radio-options';
import {
  AttachmentFileUiData,
  UpdateBoardFormData,
} from './update-board-content-box';

interface UpdateEditorBoxProps {
  title: string;
  formData: UpdateBoardFormData;
  totalAttachments: AttachmentFileUiData[];
  handleRadioChange: (fieldName: string, value: boolean) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContentChange: (value: string) => void;
  handleFileUpload: () => void;
  handleFileRemove: (id: string) => void;
  displayFileName?: string | null;
  isSubmitting?: boolean;
  lastValidationError: string | null;
}
const maxFileSize = import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB;
export const UpdateEditorBox = ({
  title,
  formData,
  totalAttachments,
  handleRadioChange,
  handleTitleChange,
  handleContentChange,
  handleFileUpload,
  handleFileRemove,
  // handleFileRemoveClick,
  // isSubmitting,
  lastValidationError,
}: UpdateEditorBoxProps) => {
  console.log('=========>', formData.content);
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
          disabled={false}
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
          disabled={false}
        />
      </div>
      <ImageButtonGroup>
        <div className='w-[100px]'>
          <ImageButton onClick={() => handleFileUpload()}>
            파일 첨부
          </ImageButton>
        </div>

        {/* ✅ 업로드된 파일 목록 */}
        {!totalAttachments || totalAttachments.length === 0 ? (
          <span className='file-upload-warning'>
            ※ {maxFileSize}MB 이하 파일만 첨부할 수 있습니다.
          </span>
        ) : (
          <FileList>
            {totalAttachments.map((attachment, index) => {
              //displayFileName 추출
              const displayFileName =
                attachment.value instanceof File
                  ? attachment.value.name
                  : attachment.value.fileName
                    ? attachment.value.fileName
                    : decodeURIComponent(
                        attachment.value.fileUrl.split('/').pop() || ''
                      );
              //file 확장자 추출
              let fileExtension = '';
              if (attachment.value instanceof File) {
                const filterType = attachment.value.type.split('/')[1];
                fileExtension = filterType;
              } else {
                const filterType = attachment.value.mimeType.split('/')[1];
                fileExtension = filterType;
              }
              return (
                <FileItem key={index}>
                  <span className='file-name'>{displayFileName}</span>
                  <span className='file-extension'>{fileExtension || ''}</span>
                  <button
                    onClick={() => {
                      handleFileRemove(attachment.id);
                    }}
                  >
                    <CircleLineXIcon fill={'#333'} />
                  </button>
                </FileItem>
              );
            })}
          </FileList>
        )}
        {lastValidationError !== null && (
          <span className='file-error-text'>{`${lastValidationError}`}</span>
        )}
      </ImageButtonGroup>
      <TextEditor
        value={formData.content}
        onChange={handleContentChange}
        placeholder='내용을 입력해 주세요.'
        readOnly={false}
      />
    </EditorBox>
  );
};
