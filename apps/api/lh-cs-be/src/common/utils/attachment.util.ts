// 첨부 용량 및 메시지 계산 유틸리티
// ATTACHMENT_MAX_SIZE 단일 환경변수를 byte 단위로 파싱합니다.
// 접미사 없이 숫자만 넣으면 “바이트”로 간주하고 kb|mb|gb 접미사도 허용합니다.
// 환경변수 미지정 또는 파싱 실패 시 10MB로 폴백됩니다.

const SIZE_UNIT_MAP: Record<string, number> = {
  b: 1,
  bytes: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
};

export const parseAttachmentMaxSizeBytes = (
  rawValue: string | undefined,
  fallbackBytes = 10 * 1024 * 1024
): number => {
  if (!rawValue) {
    return fallbackBytes;
  }

  const normalized = rawValue.trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(b|bytes|kb|mb|gb)?$/);
  if (!match) {
    return fallbackBytes;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return fallbackBytes;
  }

  const unitKey = (match[2] ?? 'b') as keyof typeof SIZE_UNIT_MAP;
  const multiplier = SIZE_UNIT_MAP[unitKey] ?? SIZE_UNIT_MAP.b;

  return Math.round(value * multiplier);
};

export const formatAttachmentMaxSize = (bytes: number): string => {
  const units = ['Bytes', 'KB', 'MB', 'GB'] as const;
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted =
    Math.abs(size - Math.round(size)) < 1e-9
      ? size.toFixed(0)
      : size.toFixed(1);
  return `${formatted}${units[unitIndex]}`;
};

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'hwp',
  'hwpx',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'pdf',
  'xls',
  'xlsx',
  'zip',
] as const;

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/x-hwp',
  'application/vnd.hancom.hwp',
  'application/vnd.hancom.hwpml',
] as const;

export const ATTACHMENT_MAX_COUNT = 5;
export const ATTACHMENT_MAX_COUNT_MESSAGE = `첨부 파일은 최대 ${ATTACHMENT_MAX_COUNT}개까지 등록할 수 있습니다.`;

export const buildAttachmentMessages = (maxSizeBytes: number) => {
  const sizeText = formatAttachmentMaxSize(maxSizeBytes);
  return {
    maxSizeBytes,
    maxSizeText: sizeText,
    allowedAttachmentDescription: `첨부 파일 (이미지: jpg, png, webp | 문서: hwp, hwpx, doc, docx, ppt, pptx, pdf, xls, xlsx | 압축: zip, 최대 ${sizeText})`,
    allowedAttachmentMessage: `첨부 파일은 이미지(jpg, png, webp), 문서(hwp, hwpx, doc, docx, ppt, pptx, pdf, xls, xlsx), 압축(zip) 형식이며 용량은 ${sizeText} 이하여야 합니다.`,
    attachmentSizeMessage: `${sizeText} 이하 파일만 등록할 수 있습니다.`,
  };
};

// Swagger 등 DI가 불가능한 위치에서 사용하는 기본 정책
export const ATTACHMENT_POLICY_DEFAULT = buildAttachmentMessages(
  parseAttachmentMaxSizeBytes(process.env.ATTACHMENT_MAX_SIZE)
);

// DI가 불가능한 enum/데코레이터에서 사용할 수 있도록 폴백 메시지 제공
export const ALLOWED_ATTACHMENT_DESCRIPTION =
  ATTACHMENT_POLICY_DEFAULT.allowedAttachmentDescription;
export const ALLOWED_ATTACHMENT_MESSAGE =
  ATTACHMENT_POLICY_DEFAULT.allowedAttachmentMessage;
export const ATTACHMENT_SIZE_MESSAGE =
  ATTACHMENT_POLICY_DEFAULT.attachmentSizeMessage;

const ALLOWED_EXTENSION_SET = new Set<string>(ALLOWED_ATTACHMENT_EXTENSIONS);
const ALLOWED_MIME_TYPE_SET = new Set<string>(ALLOWED_ATTACHMENT_MIME_TYPES);
const VIDEO_EXTENSION_SET = new Set<string>([
  'mp4',
  'mkv',
  'mov',
  'wmv',
  'avi',
  'flv',
  'webm',
  'm4v',
  '3gp',
  '3g2',
  'mpeg',
  'mpg',
]);

export const extractAttachmentExtension = (filename: string): string | null => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return null;
  }

  return filename.slice(lastDotIndex + 1).toLowerCase();
};

export const isAllowedAttachment = (file: Express.Multer.File): boolean => {
  const extension = extractAttachmentExtension(file.originalname);
  const mimetype = file.mimetype ?? '';

  if (
    (extension && VIDEO_EXTENSION_SET.has(extension)) ||
    mimetype.startsWith('video/')
  ) {
    return false;
  }

  const hasAllowedExtension = extension
    ? ALLOWED_EXTENSION_SET.has(extension)
    : false;
  const hasAllowedMimeType = ALLOWED_MIME_TYPE_SET.has(file.mimetype);

  return hasAllowedExtension || hasAllowedMimeType;
};

export const sanitizeAttachmentName = (
  name?: string | null,
  fallback = 'attachment'
): string => {
  if (!name) {
    return fallback;
  }

  const withoutPath = name.replace(/[/\\]/g, '');
  const normalizedSpaces = withoutPath.replace(/\s+/g, ' ').trim();
  const trimmed = normalizedSpaces || fallback;

  return trimmed.length > 255 ? trimmed.slice(0, 255) : trimmed;
};

export const ensureAttachmentExtension = (
  filename: string,
  originalFilename: string
): string => {
  const hasExtension = extractAttachmentExtension(filename);
  if (hasExtension) {
    return filename;
  }

  const originalExt = extractAttachmentExtension(originalFilename);
  return originalExt ? `${filename}.${originalExt}` : filename;
};
