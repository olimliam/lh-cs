import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import styled from '@emotion/styled';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useUploadContentImages } from '@/shared/api/hooks/notice-hooks';
import { RequestContentImages } from '@/shared/model/notice-api-type';
import { noticeContentTypeEnum } from '@/shared/model/notice-content-type.enum';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { useLocation } from 'react-router-dom';

// ✨ 기본 Image 포맷 가져오기
const Image = Quill.import('formats/image') as typeof Quill.import;

// ✨ 커스텀 Image 포맷 정의
class CustomImage extends (Image as any) {
  static create(value: any) {
    // value가 문자열(URL)이거나 객체일 수 있음
    const src = typeof value === 'string' ? value : value.src;
    const node = super.create(src);

    node.setAttribute('src', src);

    // 객체로 전달된 경우 추가 속성 설정
    if (typeof value === 'object') {
      if (value.alt) node.setAttribute('alt', value.alt);
      if (value.imageId) {
        node.setAttribute('data-image-id', value.imageId);
        console.log(
          '[CustomImage.create] data-image-id set to:',
          value.imageId
        );
      }
    } else {
      // 문자열로 전달된 경우 기본값 설정
      node.setAttribute('alt', 'Image');
    }

    console.log('[CustomImage.create] Final node:', node.outerHTML);
    return node;
  }

  static value(node: any) {
    return {
      src: node.getAttribute('src'),
      alt: node.getAttribute('alt'),
      imageId: node.getAttribute('data-image-id'),
    };
  }
}

// ✨ 커스텀 Image 포맷 등록 (기본 image 포맷 대체)
Quill.register(CustomImage, true);

interface TextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const EditorWrapper = styled.div`
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;

  .quill {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ql-toolbar.ql-snow {
    border-bottom: 1px solid #ccc;
    flex-shrink: 0; /* 툴바 높이 고정 */
    border-radius: 4px 4px 0 0;
  }
  .ql-container.ql-snow {
    border-radius: 0 0 4px 4px;
  }

  .ql-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ql-editor {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    color: #000000;
    font-size: 14px;
    line-height: 1.6;
    padding: 12px 15px;
    box-sizing: border-box;

    & img {
      cursor: nesw-resize !important;
      max-width: 100%;
      height: auto;
      display: block;
    }
  }

  .ql-editor.ql-blank::before {
    color: #999;
    font-style: normal;
  }

  .ql-tooltip.ql-editing {
    left: 0 !important;
  }
  .ql-tooltip input[type='text'] {
    color: #000000 !important;
  }
`;

export const TextEditor = ({
  value,
  onChange,
  placeholder = '내용을 입력해 주세요.',
  readOnly,
}: TextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUserInputRef = useRef(true); // 사용자 입력 vs 프로그래매틱 업데이트 구분
  const location = useLocation();
  const currentPath = location.pathname;

  const toast = useToastMessages();

  const { mutate: uploadContentImages } = useUploadContentImages();

  // 리사이징 상태를 전역으로 관리
  const resizeStateRef = useRef<{
    isResizing: boolean;
    startX: number;
    startWidth: number;
    startHeight: number;
    aspectRatio: number;
    currentImg: HTMLImageElement | null;
  }>({
    isResizing: false,
    startX: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 0,
    currentImg: null,
  });

  // 전역 mousemove 리스너 (한 번만 등록)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = resizeStateRef.current;
      if (!state.isResizing || !state.currentImg) return;

      const deltaX = e.clientX - state.startX;
      const newWidth = Math.max(50, state.startWidth + deltaX);
      const newHeight = newWidth / state.aspectRatio;
      state.currentImg.style.width = newWidth + 'px';
      state.currentImg.style.height = newHeight + 'px';
    };

    const handleMouseUp = () => {
      const state = resizeStateRef.current;
      if (state.currentImg) {
        // 리사이징 완료 후 HTML 업데이트
        const editor = quillRef.current?.getEditor();
        if (editor && onChange) {
          onChange(editor.root.innerHTML);
        }
      }
      state.isResizing = false;
      state.currentImg = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onChange]);

  /**
   * 이미지에 리사이징 기능 추가
   */
  const addResizeHandlers = useCallback((images: HTMLImageElement[]) => {
    images.forEach((img: HTMLImageElement) => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.dataset.resizable = 'true';

      // 기존 mousedown 리스너 제거 후 새로 추가 (중복 방지)
      const newImg = img.cloneNode(true) as HTMLImageElement;
      img.replaceWith(newImg);

      newImg.addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button !== 0) return;

        const state = resizeStateRef.current;
        state.isResizing = true;
        state.startX = e.clientX;
        state.startWidth = newImg.offsetWidth;
        state.startHeight = newImg.offsetHeight;
        state.aspectRatio = state.startWidth / state.startHeight;
        state.currentImg = newImg;

        e.preventDefault();
      });
    });
  }, []);

  // ✨ 초기값 설정 (value prop이 변경될 때마다 실행)
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor && value && isUserInputRef.current) {
      // 초기값이 있으면 한 번만 설정 (HTML 문자열을 에디터에 로드)
      editor.root.innerHTML = value;
      isUserInputRef.current = false;

      // Update 페이지: 기존 이미지들에 리사이징 기능 추가
      setTimeout(() => {
        const images = editor.root.querySelectorAll('img');
        const imageArray = Array.from(images) as HTMLImageElement[];
        if (imageArray.length > 0) {
          addResizeHandlers(imageArray);
        }
      }, 0);
    }
  }, [value]);

  // 이미지 업로드 핸들러
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 후 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (file.type.indexOf('image/') === -1) {
      toast.showError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }

    // 커서 위치 먼저 저장
    const range = editor.getSelection();
    if (!range) {
      return;
    }

    editor.disable();

    // 바로 API 호출
    const uploadData: RequestContentImages = {
      contentType: currentPath.includes('notice')
        ? noticeContentTypeEnum.NOTIFICATION
        : noticeContentTypeEnum.QUESTION_ANSWER,
      contentId: '',
      fileName: file.name,
      file: file,
      cursorIndex: range.index,
    };

    uploadContentImages(
      { payload: uploadData },
      {
        onSuccess: (data) => {
          try {
            const editor = quillRef.current?.getEditor();
            if (!editor) return;

            // 현재 커서 위치 다시 가져오기
            const cursorPosition = editor.getSelection();
            if (!cursorPosition) return;

            // 커서 위치에 이미지 삽입
            // 먼저 새 라인 생성
            editor.insertText(cursorPosition.index, '\n');

            // 그 다음 위치에 이미지 삽입
            editor.insertEmbed(
              cursorPosition.index + 1,
              'image',
              data.data.url
            );

            // 이미지 뒤에도 새 라인 생성 (다음 컨텐츠 분리)
            editor.insertText(cursorPosition.index + 2, '\n');

            // 이미지에 data-image-id 속성 추가
            setTimeout(() => {
              const images = editor.root.querySelectorAll(
                'img[src="' + data.data.url + '"]'
              );
              const imageArray = Array.from(images) as HTMLImageElement[];
              imageArray.forEach((img: HTMLImageElement) => {
                img.setAttribute('data-image-id', data.data.id);
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
              });

              // 리사이징 기능 추가
              addResizeHandlers(imageArray);

              // 변경사항 콜백 실행 (isUserInputRef 무시하고 직접 호출)
              setTimeout(() => {
                const html = editor.root.innerHTML;
                if (onChange) {
                  onChange(html);
                }
              }, 50);
            }, 0);
          } catch (error) {
            console.error('[TextEditor] Error inserting image:', error);
            toast.showError('이미지 삽입에 실패했습니다.');
          } finally {
            // 완료 후 에디터 활성화
            const editor = quillRef.current?.getEditor();
            if (editor) editor.enable();

            // 파일 입력 초기화
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        },
        onError: (error) => {
          console.error('[TextEditor] Image upload failed:', error);
          toast.showError(
            error instanceof Error ? error.message : '이미지 업로드 실패'
          );
          editor.enable();
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, 4, 5, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [
            {
              color: [
                '#000001',
                '#e60000',
                '#ff9900',
                '#ffff00',
                '#008a00',
                '#0066cc',
                '#9933ff',
                '#facccc',
                '#ffebcc',
                '#ffffcc',
                '#cce8cc',
                '#cce0f5',
                '#ebd6ff',
                '#bbbbbb',
                '#f06666',
                '#ffc266',
                '#ffff66',
                '#66b966',
                '#66a3e0',
                '#c285ff',
                '#888888',
              ],
            },
            { background: [] },
          ],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link'],
          ['clean', 'image'],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    []
  );

  const formats = [
    'font',
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
  ];

  return (
    <>
      <EditorWrapper>
        <ReactQuill
          ref={quillRef}
          theme='snow'
          defaultValue={value || ''}
          onChange={(content) => {
            if (onChange) {
              onChange(content);
            }
          }}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </EditorWrapper>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
};
