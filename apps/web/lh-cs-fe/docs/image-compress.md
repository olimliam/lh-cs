## Profile Image Compress

- 참고 컴포넌트
  - /apps/web/lh-cs-fe/src/shared/hooks/compress-profile-image.tsx
  - /apps/web/lh-cs-fe/src/shared/hooks/use-image-compression.tsx
  - /apps/web/lh-cs-fe/src/features/profile-edit/ui/profile-image-box.tsx
  - /apps/web/lh-cs-fe/src/features/profile-edit/ui/profile-edit-box.tsx

### history

- 프로필 이미지가 일정 용량 이상 넘어가면 수정 요청 실패하는 경우가 발생됨.
- 이에 제한을 500kb 이내로 두기로 결정함.
- 사용자에게 용량을 제한 두는 것은 사용성 불편하다 판단, FE에서 이미지 압축 기능을 추가하는 것으로 정리.

### 사용 library
- browser-image-compression
  - 직접 구현하는 것 보다 있는 라이브러리를 사용하는 것이 기능 안정 면에서 좋다고 판단.
  - react를 사용하기 때문에 react-image-file-resizer 를 사용할지 고민했지만,
    react-image-file-resizer는 픽셀 크기를 줄이는 것(이미지 크기)에 좀 더 장점이 있는 라이브러리라고 판단했음.
  - 해당 라이브러리는 웹워커 옵션(메인 스레드 비차단 기능)도 지원해, 유사시 UI 비동기 처리(이미지 압축되는 동안 spinner 노출) 도 가능.
  - 사용자 업로드 용량에 제한이 없기 때문에, 이미지 크기만이 문제가 아니라 용량 자체를 줄일 수 있는 확실한 라이브러리가 더 맞다고 판단해 해당 라이브러리 사용을 결정하게 되었음.

### 메인 스레드 차단 / 비차단 문제
- UI 렌더링 / JavaScript 실행 / 이벤트 처리는 대부분 메인 스레드(main thread) 에서 처리.
- 메인 스레드 차단 : 이미지 리사이징, 압축등이 CPU를 많이 쓰는 연산이고 해당 작업이 메인 스레드에서 진행되기 때문에
  작업이 끝날 때 까지 UI 이벤트가 멈추는 현상.
- 메인 스레드 비차단 : 무거운 작업(예: 이미지 압축)을 메인 스레드와 분리된 스레드(백그라운드) 에서 처리한다고 함.
이걸 위해 브라우저에서는 Web Worker 라는 기술을 제공.
  - 메인 스레드는 UI를 계속 부드럽게 유지하고,
  - 별도의 worker 스레드가 압축/리사이즈 작업을 수행하고,
  - 끝나면 결과를 메인 스레드로 전달.

### 구현 방식
**플로우:**
```
1. 사용자가 profile-edit-box 에서 이미지 등록
2. profile-edit-modal 에 선언된 handleFileChange 실행
3. 이미지 압축 실행
4. formData 에 profileImage File 데이터 추가
5. profile-edit-box 에서 imagePrviewUrl / stableImageSrc / shouldShowImage 실행
6. preview로 신규 등록+압축된 이미지 노출 
```

**이미지 압축 hooks:**
```typescript
// compress-profile-image.tsx
export const compressProfileImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> => {
  const startTime = performance.now();

  //default 옵션 설정에서 500kb 이하로 압축하기를 설정 / 기타 라이브러리에서 지원하는 옵션들을 설정할 수 있음.
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

// use-image-compression.ts
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

      // 유효성 검사가 끝나면 실제 이미지 압축 실행
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
```
