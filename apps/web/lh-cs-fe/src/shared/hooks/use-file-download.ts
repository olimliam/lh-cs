function useFileDownload() {
  /**
   * URL에서 파일명 추출
   * @example "https://cdn.example.com/notifications/maintenance.pdf" → "maintenance.pdf"
   */
  const getFileName = (
    fileUrl?: string | null,
    fileName?: string | null
  ): string => {
    if (fileName && fileName.trim().length > 0) {
      return fileName;
    }

    if (!fileUrl) return '첨부파일';

    try {
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || '첨부파일';

      // URL 디코딩 (한글 파일명 지원)
      return decodeURIComponent(fileName);
    } catch (error) {
      console.error('❌ Invalid file URL:', error);
      return '첨부파일';
    }
  };
  const handleDownload = (fileUrl: string, getFileName: string) => {
    if (!fileUrl) {
      console.warn('⚠️ No file URL provided');
      return;
    }

    try {
      // ✅ 방법 1: <a> 태그 동적 생성 (권장)
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = getFileName; // 파일명 지정
      link.target = '_blank'; // 새 탭에서 열기 (다운로드 실패 시 대비)

      // DOM에 추가하지 않고 클릭 이벤트 트리거
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('파일 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return {
    getFileName,
    handleDownload,
  };
}

export default useFileDownload;
