import React, { useRef, useState } from 'react';
import { shareImage, extractImageMetadata } from '../utils/image-share.utils';
import useSlideStore from '../model/use-slide-store';
import useIOClient from '../model/use-io-client';

interface ImageUploaderProps {
  children: React.ReactNode; // 업로드 버튼
  onUploadStart?: () => void;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // 최대 파일 크기 (bytes)
  acceptedTypes?: string[]; // 허용된 파일 타입
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  children,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { slideList, setSlideList } = useSlideStore();
  const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  const { publish } = useIOClient(socketUrl, { onMessage: () => {} });

  const currentSlide = slideList.find((slide) => slide.isSelected);

  const validateFile = (file: File): string | null => {
    // 파일 타입 검사
    if (!acceptedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${acceptedTypes.join(', ')})`;
    }

    // 파일 크기 검사
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (!currentSlide) {
      onUploadError?.('선택된 슬라이드가 없습니다.');
      return;
    }

    // 파일 유효성 검사
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      onUploadStart?.();

      // 메타데이터 추출
      const metadata = extractImageMetadata(file);
      console.log('Uploading image:', metadata);

      // 진행률 시뮬레이션 (실제 구현에서는 업로드 진행률 사용)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // CDN 업로드 및 실시간 공유
      const imageUrl = await shareImage(file, currentSlide.id, publish);

      // 업로드 완료
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 로컬 상태 업데이트
      setSlideList(
        slideList.map((slide) =>
          slide.id === currentSlide.id ? { ...slide, image: imageUrl } : slide
        )
      );

      onUploadComplete?.(imageUrl);

      // 성공 메시지
      console.log(`Image uploaded successfully: ${imageUrl}`);
    } catch (error) {
      console.error('Image upload failed:', error);
      onUploadError?.(
        error instanceof Error ? error.message : '업로드에 실패했습니다.'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // input 초기화 (같은 파일 재선택 가능)
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        {children}

        {/* 업로드 진행률 표시 */}
        {isUploading && (
          <div className='absolute inset-0 flex items-center justify-center rounded bg-black/50'>
            <div className='text-xs font-medium text-white'>
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type='file'
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className='hidden'
      />
    </>
  );
};

export default ImageUploader;
