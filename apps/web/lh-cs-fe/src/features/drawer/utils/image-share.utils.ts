import { compressImage, convertToWebP } from '@/shared/utils/file-utils';
import { DRAW_TYPE } from '../model/whiteboard.types';
import { API_BASE_URL } from '@/shared/api/api-config';

/**
 * CDN 기반 이미지 공유 시스템
 */

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * CDN에 이미지 업로드하고 URL 반환
 */
const buildApiUrl = (path: string) => {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const uploadImageToCDN = async (file: File): Promise<string> => {
  try {
    // 1. 이미지 최적화
    const webpBlob = await convertToWebP(file);
    const compressedBlob = await compressImage(webpBlob);

    // 2. CDN 업로드
    const formData = new FormData();
    formData.append('image', compressedBlob, `image-${Date.now()}.webp`);
    formData.append('folder', 'whiteboard'); // 폴더 구조화

    const response = await fetch(buildApiUrl('/upload/image'), {
      method: 'POST',
      body: formData,
      headers: {
        // 인증 헤더 필요 시 추가
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.imageUrl) {
      throw new Error('Invalid upload response');
    }

    return result.imageUrl; // CDN URL 반환
  } catch (error) {
    console.error('CDN upload failed:', error);
    throw new Error('Failed to upload image to CDN');
  }
};

/**
 * 이미지 공유 (CDN 업로드 + 실시간 알림)
 */
export const shareImage = async (
  file: File,
  slideId: string,
  publishCallback: (message: any) => void
): Promise<string> => {
  try {
    // 1. 썸네일 생성 (즉시 미리보기용)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const thumbnailPromise = new Promise<string>((resolve) => {
      img.onload = () => {
        canvas.width = 200;
        canvas.height = 150;
        ctx?.drawImage(img, 0, 0, 200, 150);
        resolve(canvas.toDataURL('image/webp', 0.3));
      };
      img.src = URL.createObjectURL(file);
    });

    // 2. CDN 업로드와 썸네일 생성 동시 진행
    const [cdnUrl, thumbnail] = await Promise.all([
      uploadImageToCDN(file),
      thumbnailPromise,
    ]);

    // 3. 실시간 알림 (CDN URL 전송)
    publishCallback({
      type: DRAW_TYPE.IMAGE_UPDATE,
      slideId,
      imageUrl: cdnUrl,
      thumbnail, // 로딩 중 표시용
      timestamp: Date.now(),
    });

    return cdnUrl;
  } catch (error) {
    console.error('Image sharing failed:', error);
    throw error;
  }
};

/**
 * 썸네일 생성 (canvas 기반)
 */
export const generateThumbnail = (
  canvas: HTMLCanvasElement,
  maxWidth: number = 200,
  maxHeight: number = 150,
  quality: number = 0.3
): string => {
  const thumbnailCanvas = document.createElement('canvas');

  // 비율 유지하면서 크기 계산
  const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  thumbnailCanvas.width = canvas.width * scale;
  thumbnailCanvas.height = canvas.height * scale;

  const ctx = thumbnailCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get thumbnail canvas context');
  }

  // 원본 이미지를 썸네일 크기로 그리기
  ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  // WebP로 압축하여 base64 반환
  return thumbnailCanvas.toDataURL('image/webp', quality);
};

/**
 * 이미지 URL 유효성 검사
 */
export const validateImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === 'https:' &&
      (urlObj.hostname.includes('cdn') ||
        urlObj.hostname.includes('amazonaws') ||
        urlObj.hostname.includes('cloudfront'))
    );
  } catch {
    return false;
  }
};

/**
 * 이미지 메타데이터 추출
 */
export const extractImageMetadata = (file: File) => ({
  name: file.name,
  size: file.size,
  type: file.type,
  lastModified: file.lastModified,
  sizeFormatted: formatFileSize(file.size),
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
