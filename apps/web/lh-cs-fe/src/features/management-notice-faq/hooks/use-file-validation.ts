import { useState, useCallback } from 'react';

/**
 * 허용된 MIME 타입 정의
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
const ALLOWED_MIME_TYPES = [
  // 이미지
  'image/jpeg',
  'image/png',
  'image/webp',
  // 문서
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  // 압축
  'application/zip',
  'application/x-zip-compressed',
  // HWP (브라우저마다 다를 수 있음)
  'application/x-hwp',
  'application/haansofthwp',
  'application/vnd.hancom.hwp',
  'application/vnd.hancom.hwpx',
] as const;

/**
 * 허용된 확장자 (MIME 타입이 빈 경우 대비)
 */
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.hwp',
  '.hwpx',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.zip',
] as const;

/**
 * 기본 최대 파일 크기 (10MB)
 */
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 파일 타입 카테고리
 */
export type FileCategory = 'image' | 'document' | 'archive' | 'unknown';

/**
 * 파일 검증 결과
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 파일 정보
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  category: FileCategory;
}

/**
 * Hook 옵션
 */
export interface UseFileValidationOptions {
  /**
   * 최대 파일 크기 (bytes)
   * @default 10 * 1024 * 1024 (10MB)
   */
  maxFileSize?: number;

  /**
   * 허용된 MIME 타입 (커스텀)
   */
  allowedMimeTypes?: readonly string[];

  /**
   * 허용된 확장자 (커스텀)
   */
  allowedExtensions?: readonly string[];
  /**
   * 모든 파일 형식 허용 (화이트리스트 검증 무시)
   * @default false
   */
  allowAllFileTypes?: boolean;
}

/**
 * 파일 확장자 추출
 * @param filename - 파일명
 * @returns 소문자 확장자 (예: ".pdf")
 */
const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
};

/**
 * 파일 타입 카테고리 반환
 * @param file - File 객체
 * @returns 파일 카테고리
 */
const getFileCategory = (file: File): FileCategory => {
  // 1. MIME 타입으로 판단
  if (file.type.startsWith('image/')) return 'image';
  if (
    file.type.includes('pdf') ||
    file.type.includes('msword') ||
    file.type.includes('vnd.') ||
    file.type.includes('hwp')
  ) {
    return 'document';
  }
  if (file.type.includes('zip') || file.type.includes('compressed')) {
    return 'archive';
  }

  // 2. 확장자로 판단 (MIME 타입이 없거나 신뢰할 수 없는 경우)
  const ext = getFileExtension(file.name);
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return 'image';
  if (
    [
      '.pdf',
      '.hwp',
      '.hwpx',
      '.doc',
      '.docx',
      '.ppt',
      '.pptx',
      '.xls',
      '.xlsx',
    ].includes(ext)
  ) {
    return 'document';
  }
  if (['.zip'].includes(ext)) return 'archive';

  return 'unknown';
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes - 파일 크기 (bytes)
 * @returns 형식화된 문자열 (예: "1.5 MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * ✅ 파일 검증 커스텀 Hook
 *
 * @description
 * - 파일 크기, MIME 타입, 확장자 검증
 * - HWP 파일 예외 처리
 * - 파일 정보 추출 (카테고리, 확장자 등)
 *
 * @example
 * ```tsx
 * const { validateFile, getFileInfo, isValidExtension } = useFileValidation();
 *
 * const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = event.target.files?.[0];
 *   if (!file) return;
 *
 *   const validation = validateFile(file);
 *   if (!validation.valid) {
 *     console.error(validation.error);
 *     return;
 *   }
 *
 *   const info = getFileInfo(file);
 *   console.log('파일 정보:', info);
 * };
 * ```
 *
 * @param options - Hook 옵션
 * @returns 파일 검증 함수 및 유틸리티
 */
export const useFileValidation = (options: UseFileValidationOptions = {}) => {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes = ALLOWED_MIME_TYPES,
    allowedExtensions = ALLOWED_EXTENSIONS,
    allowAllFileTypes,
  } = options;

  const [lastValidationError, setLastValidationError] = useState<string | null>(
    null
  );

  /**
   * ✅ 파일 유효성 검증
   *
   * @param file - 검증할 파일
   * @returns 검증 결과 객체
   */
  const validateFile = useCallback(
    (file: File): FileValidationResult => {
      // 1. 파일 크기 체크
      if (file.size > maxFileSize) {
        const error = `※ ${formatFileSize(maxFileSize)} 이하 파일만 등록할 수 있습니다.`;
        setLastValidationError(error);
        return {
          valid: false,
          error,
        };
      }

      // 2. 모든 파일 형식 허용하지 않는 경우만 형식 검증
      if (!allowAllFileTypes) {
        // MIME 타입 체크
        const mimeTypeValid =
          file.type && allowedMimeTypes.includes(file.type as any);

        // 확장자 체크 (MIME 타입이 없거나 신뢰할 수 없는 경우)
        const extension = getFileExtension(file.name);
        const extensionValid = allowedExtensions.includes(extension as any);

        // HWP 파일 예외 처리 (브라우저가 MIME 타입을 인식 못할 수 있음)
        const isHwpFile = extension === '.hwp' || extension === '.hwpx';

        if (!mimeTypeValid && !extensionValid && !isHwpFile) {
          const error = `지원하지 않는 파일 형식입니다. (${extension || file.type || 'unknown'})`;
          setLastValidationError(error);
          return {
            valid: false,
            error,
          };
        }
      }

      setLastValidationError(null);
      return { valid: true };
    },
    [maxFileSize, allowedMimeTypes, allowedExtensions, allowAllFileTypes]
  );

  /**
   * ✅ 파일 정보 추출
   *
   * @param file - File 객체
   * @returns 파일 상세 정보
   */
  const getFileInfo = useCallback((file: File): FileInfo => {
    const extension = getFileExtension(file.name);
    const category = getFileCategory(file);

    return {
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      extension,
      category,
    };
  }, []);

  /**
   * ✅ 확장자 유효성 검증
   *
   * @param filename - 파일명
   * @returns 유효 여부
   */
  const isValidExtension = useCallback(
    (filename: string): boolean => {
      const extension = getFileExtension(filename);
      return allowedExtensions.includes(extension as any);
    },
    [allowedExtensions]
  );

  /**
   * ✅ MIME 타입 유효성 검증
   *
   * @param mimeType - MIME 타입
   * @returns 유효 여부
   */
  const isValidMimeType = useCallback(
    (mimeType: string): boolean => {
      return allowedMimeTypes.includes(mimeType as any);
    },
    [allowedMimeTypes]
  );

  /**
   * ✅ 파일 크기 검증
   *
   * @param fileSize - 파일 크기 (bytes)
   * @returns 유효 여부
   */
  const isValidFileSize = useCallback(
    (fileSize: number): boolean => {
      return fileSize <= maxFileSize;
    },
    [maxFileSize]
  );

  /**
   * ✅ 에러 메시지 초기화
   */
  const clearError = useCallback(() => {
    setLastValidationError(null);
  }, []);

  return {
    /**
     * 파일 검증 함수
     */
    validateFile,

    /**
     * 파일 정보 추출 함수
     */
    getFileInfo,

    /**
     * 확장자 유효성 검증
     */
    isValidExtension,

    /**
     * MIME 타입 유효성 검증
     */
    isValidMimeType,

    /**
     * 파일 크기 유효성 검증
     */
    isValidFileSize,

    /**
     * 마지막 검증 에러 메시지
     */
    lastValidationError,

    /**
     * 에러 메시지 초기화
     */
    clearError,

    /**
     * 허용된 확장자 목록
     */
    allowedExtensions: [...allowedExtensions],

    /**
     * 허용된 MIME 타입 목록
     */
    allowedMimeTypes: [...allowedMimeTypes],

    /**
     * 최대 파일 크기 (bytes)
     */
    maxFileSize,

    /**
     * 최대 파일 크기 (형식화된 문자열)
     */
    maxFileSizeFormatted: formatFileSize(maxFileSize),
  };
};

/**
 * ✅ 유틸리티 함수 export
 */
export { getFileExtension, getFileCategory, formatFileSize };
