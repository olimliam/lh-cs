import imageCompression from 'browser-image-compression';

/**
 * 이미지 압축 옵션 인터페이스
 */
export interface ImageCompressionOptions {
  /** 최대 파일 크기 (MB) */
  maxSizeMB?: number;
  /** 최대 가로/세로 크기 (픽셀) */
  maxWidthOrHeight?: number;
  /** Web Worker 사용 여부 (성능 향상) */
  useWebWorker?: boolean;
  /** 이미지 품질 (0~1) */
  quality?: number;
  /** 초기 품질 설정 */
  initialQuality?: number;
  /** 파일 타입 강제 변환 */
  fileType?: string;
}

/**
 * 압축 결과 정보
 */
export interface CompressionResult {
  /** 압축된 파일 */
  file: File;
  /** 원본 크기 (bytes) */
  originalSize: number;
  /** 압축된 크기 (bytes) */
  compressedSize: number;
  /** 압축률 (%) */
  compressionRatio: number;
  /** 처리 시간 (ms) */
  processingTime: number;
}

/**
 * 프로필 이미지 압축 함수
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축 결과
 */
export const compressProfileImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> => {
  const startTime = performance.now();

  const defaultOptions = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 400, // 프로필 이미지 최적 크기
    useWebWorker: true, // 메인 스레드 보호
    quality: 0.85, // 높은 품질 유지
    initialQuality: 0.9, // 초기 품질
    fileType: 'image/jpeg', // JPEG로 통일 (용량 최적화)
    ...options,
  };

  try {
    console.warn('이미지 압축 시작:', {
      파일명: file.name,
      원본크기: `${(file.size / 1024).toFixed(1)}KB`,
      원본타입: file.type,
    });

    const compressedFile = await imageCompression(file, defaultOptions);
    const transformFile = new File([compressedFile], file.name, {
      type: compressedFile.type || file.type,
      lastModified: Date.now(),
    });
    const endTime = performance.now();

    const result: CompressionResult = {
      file: transformFile,
      originalSize: file.size,
      compressedSize: transformFile.size,
      compressionRatio: (1 - transformFile.size / file.size) * 100,
      processingTime: endTime - startTime,
    };

    console.warn('이미지 압축 완료:', {
      압축후크기: `${(result.compressedSize / 1024).toFixed(1)}KB`,
      압축률: `${result.compressionRatio.toFixed(1)}%`,
      처리시간: `${result.processingTime.toFixed(0)}ms`,
    });

    return result;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    throw new Error('이미지 압축 중 오류가 발생했습니다.');
  }
};

/**
 * 일반 이미지 압축 함수 (게시글 등)
 */
export const compressGeneralImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> => {
  const defaultOptions = {
    maxSizeMB: 1, // 1MB
    maxWidthOrHeight: 1200, // 일반 이미지 크기
    useWebWorker: true,
    quality: 0.8,
    ...options,
  };

  return compressProfileImage(file, defaultOptions);
};

/**
 * 파일 유효성 검사
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  // const maxSizeMB = 10; // 원본 파일 최대 크기

  if (!allowedTypes.includes(file.type)) {
    return '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP만 가능)';
  }

  // if (file.size > maxSizeMB * 1024 * 1024) {
  //   return `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`;
  // }

  return null;
};

/**
 * 이미지 미리보기 URL 생성 (메모리 관리 포함)
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 이미지 미리보기 URL 해제 (메모리 누수 방지)
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};
