// content에서 이미지 ID 추출하는 함수
const extractImageIds = (htmlContent: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const imgElements = doc.querySelectorAll('img[data-image-id]');
  return Array.from(imgElements)
    .map((img) => img.getAttribute('data-image-id') || '')
    .filter(Boolean);
};

/**
 * ✅ 유틸리티 함수 export
 */
export { extractImageIds };
