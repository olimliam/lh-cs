import { Stack } from '@mui/material';
import { useRef, useState } from 'react';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useFileValidation } from '../hooks/use-file-validation';
import { HiddenFileInput } from '../style/board-style';
import { TextEditorHeader } from './text-editor-header';
import { CreateEditorBox } from './create-editor-box';
import { useCreateQna } from '@/shared/api/hooks/qna-hooks';
import { extractImageIds } from '../hooks/use-content-extract-image-ids';
import { generateFileUuid } from '../utils/generate-file-uuid';

export interface BoardFormData {
  title: string;
  content: string;
  isPublic: boolean;
  fileName?: string | null;
  attachmentNames: string[];
  contentImageRefs: string[];
  attachments: Array<{ file: File; id: string }> | null;
}

interface CreateQnaContentBoxProps {
  handleUndoPage: () => void;
}

const maxFileSize = import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB
  ? Number(import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB) * 1024 * 1024
  : 10 * 1024 * 1024; // 기본값 10MB

const CreateQnaContentBox = ({ handleUndoPage }: CreateQnaContentBoxProps) => {
  // ✅ 공지사항 생성 mutation hook
  const { mutate: createQna, isPending: isSubmitting } = useCreateQna();
  const toast = useToastMessages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ✅ 파일 검증 hook 사용
  const { validateFile, lastValidationError, clearError, allowedExtensions } =
    useFileValidation({
      maxFileSize: maxFileSize,
      allowAllFileTypes: true,
    });

  // ✅ 폼 상태 관리
  const [formData, setFormData] = useState<BoardFormData>({
    title: '',
    content: '',
    isPublic: false,
    attachmentNames: [],
    contentImageRefs: [],
    attachments: [],
  });

  // ✅ 제목 변경 핸들러
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      title: event.target.value,
    }));
  };

  // ✅ 내용 변경 핸들러 (React Quill)
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleRadioChange = (fieldName: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleFileUpload = () => {
    if (isSubmitting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // 파일 유효성 검증
    const validation = validateFile(file);

    if (!validation.valid) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const fileId = generateFileUuid(); // 각 파일에 고유 ID 부여
    // 파일 리스트에 추가
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), { file, id: fileId }],
      attachmentNames: [...prev.attachmentNames, file.name],
    }));

    toast.showSuccess(`${file.name} 파일이 업로드되었습니다.`);

    // input 초기화
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((item) => item.id !== fileId) || [],
      attachmentNames: prev.attachmentNames.filter((name) => {
        // 삭제된 파일의 이름도 제거
        const removedFile = prev.attachments?.find(
          (item) => item.id === fileId
        );
        return removedFile?.file.name !== name;
      }),
    }));
    toast.showSuccess('파일이 제거되었습니다.');
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    // 1. 유효성 검증
    if (!formData.title.trim()) {
      toast.showError('제목을 입력해 주세요.');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      toast.showError('내용을 입력해 주세요.');
      return;
    }
    // 이미지 ID 추출
    const imageIds = extractImageIds(formData.content);

    const newFormData = {
      title: formData.title,
      content: formData.content,
      isPublic: formData.isPublic,
      attachmentNames: formData.attachmentNames,
      contentImageRefs: imageIds,
      attachments: formData.attachments?.map((item) => item.file) || [], // File 객체만 추출
    };

    // FormData 내용 로깅 (디버깅용)
    // console.log('newFormData:', newFormData);
    // return;
    // Mutation 실행
    createQna(newFormData, {
      onSuccess: (data) => {
        toast.showSuccess('QnA가 등록되었습니다.');
        console.log('생성된 QnA:', data);

        // 폼 초기화
        setFormData({
          title: '',
          content: '',
          isPublic: false,
          attachmentNames: [],
          contentImageRefs: [],
          attachments: [],
        });

        // 목록 페이지로 이동
        handleUndoPage();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'QnA 등록에 실패했습니다.';
        toast.showError(message);
      },
    });
  };

  return (
    <>
      <Stack spacing={0} sx={{ height: '100%' }}>
        <TextEditorHeader
          handleUndoPage={handleUndoPage}
          handleSubmit={handleSubmit}
          submitLabel='등록'
          loadingLabel='업로드 중...'
          isSubmitting={isSubmitting}
        />

        <CreateEditorBox
          title='자주 묻는 질문'
          formData={formData}
          handleRadioChange={handleRadioChange}
          handleTitleChange={handleTitleChange}
          handleContentChange={handleContentChange}
          handleFileUpload={handleFileUpload}
          handleFileRemove={handleFileRemove}
          isSubmitting={isSubmitting}
          lastValidationError={lastValidationError}
        />
      </Stack>
      <HiddenFileInput
        ref={fileInputRef}
        type='file'
        accept={allowedExtensions.join(',')}
        onChange={handleFileChange}
      />
    </>
  );
};

export default CreateQnaContentBox;
