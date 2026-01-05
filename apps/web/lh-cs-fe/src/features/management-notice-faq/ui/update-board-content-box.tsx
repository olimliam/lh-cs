import { Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import {
  usePublicNoticeById,
  useUpdateNotice,
} from '@/shared/api/hooks/notice-hooks';
import { useFileValidation } from '../hooks/use-file-validation';
import { HiddenFileInput } from '../style/board-style';
import { TextEditorHeader } from './text-editor-header';
import { UpdateEditorBox } from './update-editor-box';
import {
  NoticeAttachments,
  NoticeFaqItemResponseById,
} from '@/shared/model/notice-api-type';
import { RequestUpdateNoticeFaq } from '@/shared/model/notice-faq-type';
import { extractImageIds } from '../hooks/use-content-extract-image-ids';
import { generateFileUuid } from '../utils/generate-file-uuid';

export interface UpdateBoardFormData {
  title: string;
  content: string;
  isPublic: boolean;
  removeExistingFiles: boolean; // removeExistingFiles 로 변경됨. 전체 지우라는 이야기인지?
  attachmentNames: string[];
  attachmentIdsToRemove: string[]; // 삭제할 첨부파일 ID 를 배열로 입력
  contentImageRefs: string[];
}
// 기존/신규 파일 핸들링을 위한 새로운 interface
export interface AttachmentFileUiData {
  id: string;
  value: NoticeAttachments | File;
}

interface UpdateBoardContentBoxProps {
  id: string;
  handleUndoPage: () => void;
}

const maxFileSize = import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB
  ? Number(import.meta.env.VITE_MAX_FILE_UPLOAD_SIZE_MB) * 1024 * 1024
  : 10 * 1024 * 1024; // 기본값 10MB

const UpdateBoardContentBox = ({
  id,
  handleUndoPage,
}: UpdateBoardContentBoxProps) => {
  // 공지사항 생성 mutation hook
  const { data: noticeItemData } = usePublicNoticeById(id);

  const toast = useToastMessages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 파일 검증 hook 사용
  const { validateFile, lastValidationError, clearError, allowedExtensions } =
    useFileValidation({
      maxFileSize: maxFileSize,
      allowAllFileTypes: true,
    });
  // 폼 상태 관리
  const [formData, setFormData] = useState<UpdateBoardFormData>(
    {} as UpdateBoardFormData
  );
  const [totalAttachments, setTotalAttachments] = useState<
    AttachmentFileUiData[]
  >([]);
  const [newFileData, setNewFileData] = useState<File[]>([]);
  const { mutate: updateNotice, isPending: isSubmitting } = useUpdateNotice();

  useEffect(() => {
    const data = noticeItemData?.data as NoticeFaqItemResponseById | undefined;
    const title = data?.title ?? '제목 없음';
    const content = data?.content ?? '';
    const isPublic = data?.isPublic ?? false;
    const attachments = data?.attachments ?? [];

    if (data) {
      setFormData({
        title: title,
        content: content,
        isPublic: isPublic,
        removeExistingFiles: false,
        attachmentNames: [],
        attachmentIdsToRemove: [],
        contentImageRefs: [],
      });

      const newInitAttachments: AttachmentFileUiData[] = attachments.map(
        (item) => {
          const fileId = generateFileUuid(); // 각 파일에 고유 ID 부여
          return {
            id: fileId,
            value: item,
          };
        }
      );
      setTotalAttachments(newInitAttachments);
    }
  }, [noticeItemData]);

  // 제목 변경 핸들러
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      title: event.target.value,
    }));
  };

  // 내용 변경 핸들러 (React Quill)
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

    // 새 파일 설정
    setFormData((prev) => ({
      ...prev,
      attachmentNames: [...prev.attachmentNames, file.name], //실제 전송을 위해 새 파일 이름만 담는 변수.
    }));

    const fileId = generateFileUuid(); // 각 파일에 고유 ID 부여
    //UI 표현을 위해 기존+신규 파일 추가/삭제 핸들링.
    setTotalAttachments((prev) => [...prev, { id: fileId, value: file }]);
    //실제 전송을 위해 새 파일만 담는 변수.
    setNewFileData((prev) => [...prev, file]);

    toast.showSuccess(`${file.name} 파일이 업로드되었습니다.`);

    // input 초기화
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (id: string) => {
    // 삭제할 항목 찾기
    const itemToRemove = totalAttachments.find((item) => item.id === id);

    if (!itemToRemove) return;

    // totalAttachments에서 해당 id 항목 제거
    setTotalAttachments((prev) => prev.filter((item) => item.id !== id));

    // 기존 파일인지 신규 파일인지 판별
    if (itemToRemove.value instanceof File) {
      // 신규 파일 삭제
      const fileName = itemToRemove.value.name;
      setNewFileData((prev) => prev.filter((file) => file.name !== fileName));
      setFormData((prev) => ({
        ...prev,
        attachmentNames: prev.attachmentNames.filter(
          (name) => name !== fileName
        ),
      }));
    } else {
      // 기존 파일 삭제 - ID를 attachmentIdsToRemove에 추가
      setFormData((prev) => ({
        ...prev,
        attachmentIdsToRemove: [
          ...prev.attachmentIdsToRemove,
          (itemToRemove.value as NoticeAttachments).attachmentId,
        ],
      }));
    }

    toast.showSuccess('파일이 제거되었습니다.');
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (isSubmitting) return;
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

    const newFormData: RequestUpdateNoticeFaq = {
      title: formData.title,
      content: formData.content,
      isPublic: formData.isPublic,
      attachmentNames: formData.attachmentNames,
      contentImageRefs: imageIds,
      attachments: newFileData,
      removeExistingFiles: formData.removeExistingFiles,
      attachmentIdsToRemove: formData.attachmentIdsToRemove,
    };
    // 3. FormData 내용 로깅 (디버깅용)
    // console.log('formData ======>', newFormData);
    // return;
    // 3. Mutation 실행
    updateNotice(
      { id: id, payload: newFormData },
      {
        onSuccess: () => {
          toast.showSuccess('공지사항이 수정되었습니다.');

          // 목록 페이지로 이동
          handleUndoPage();
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : '공지사항 수정에 실패했습니다.';
          toast.showError(message);
        },
      }
    );
  };

  return (
    <>
      <Stack spacing={0} sx={{ height: '100%' }}>
        <TextEditorHeader
          handleUndoPage={handleUndoPage}
          handleSubmit={handleSubmit}
          submitLabel='수정'
          // loadingLabel='업로드 중...'
          isSubmitting={isSubmitting}
        />

        <UpdateEditorBox
          title={'공지사항'}
          formData={formData}
          totalAttachments={totalAttachments}
          handleRadioChange={handleRadioChange}
          handleTitleChange={handleTitleChange}
          handleContentChange={handleContentChange}
          handleFileUpload={handleFileUpload}
          handleFileRemove={handleFileRemove}
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

export default UpdateBoardContentBox;
