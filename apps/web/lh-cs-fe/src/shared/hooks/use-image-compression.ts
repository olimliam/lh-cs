import { useState, useCallback } from 'react';
import {
  type CompressionResult,
  compressProfileImage,
  type ImageCompressionOptions,
  validateImageFile,
} from './compress-profile-image';

interface UseImageCompressionState {
  isCompressing: boolean;
  error: string | null;
  result: CompressionResult | null;
}

interface UseImageCompressionReturn extends UseImageCompressionState {
  compressImage: (
    file: File,
    options?: ImageCompressionOptions
  ) => Promise<File | null>;
  reset: () => void;
}

export const useImageCompression = (): UseImageCompressionReturn => {
  const [state, setState] = useState<UseImageCompressionState>({
    isCompressing: false,
    error: null,
    result: null,
  });

  const compressImage = useCallback(
    async (
      file: File,
      options?: ImageCompressionOptions
    ): Promise<File | null> => {
      if (file.size / 1024 < 500) {
        setState((prev) => ({
          ...prev,
          isCompressing: false,
          file,
          error: null,
        }));
        return file;
      }

      // 파일 유효성 검사
      const validationError = validateImageFile(file);
      if (validationError) {
        setState((prev) => ({ ...prev, error: validationError }));
        return null;
      }

      setState((prev) => ({ ...prev, isCompressing: true, error: null }));

      try {
        const result = await compressProfileImage(file, options);
        setState((prev) => ({
          ...prev,
          isCompressing: false,
          result,
          error: null,
        }));
        return result.file;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '압축 중 오류가 발생했습니다.';
        setState((prev) => ({
          ...prev,
          isCompressing: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isCompressing: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    compressImage,
    reset,
  };
};
