import imageCompression from 'browser-image-compression';

export const convertToWebP = (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((webpBlob) => {
          if (webpBlob) {
            resolve(webpBlob);
          } else {
            reject(new Error('WebP 변환 실패'));
          }
        }, 'image/webp');
      } else {
        reject(new Error('Canvas 컨텍스트 생성 실패'));
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('이미지 로드 실패'));
    };

    img.src = url;
  });
};

export const compressImage = async (fileBlob: Blob): Promise<Blob> => {
  const options = {
    maxSizeMB: 1, // 최대 크기 (MB)
    maxWidthOrHeight: 1920, // 최대 너비 또는 높이
    useWebWorker: true, // 웹 워커 사용 여부
  };

  const file = new File([fileBlob], 'compressedImage.webp', {
    type: 'image/webp',
  });
  const compressedFile = await imageCompression(file, options);
  return compressedFile;
};
