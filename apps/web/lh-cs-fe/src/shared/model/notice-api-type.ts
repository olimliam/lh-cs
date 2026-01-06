import { NoticeFaqItemData } from '@/shared/model/notice-faq-type';
import { noticeContentTypeEnum } from './notice-content-type.enum';
/**
 * 백엔드 표준 API 응답 래퍼
 * notice, qna 공통 사용
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
interface NoticeContentImages {
  id: string;
  contentId: string;
  contentType: noticeContentTypeEnum;
  s3Key: string;
  url: string;
  fileName: string;
  contentTypeHeader: string;
  isUsed: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface NoticeAttachments {
  attachmentId: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  fileSize: string;
  order: number | null;
}

// -------------------------------------------

export interface NoticeFaqResponseData {
  data: NoticeFaqItemData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type GetTotalNoticeFaqResponse = ApiResponse<NoticeFaqResponseData>;

export interface NoticeFaqItemResponseById extends NoticeFaqItemData {
  contentImages: NoticeContentImages[]; //
  attachments: NoticeAttachments[]; //
}

export interface NoticeResponseDataById {
  data: NoticeFaqItemResponseById;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type GetNoticeFaqResponseById = ApiResponse<NoticeResponseDataById>;

export type CreateNoticeFaqResponse = ApiResponse<NoticeFaqItemResponseById>;

// ---------------------------------------------

// 본문 이미지 첨부 관련 타입
export interface RequestContentImages {
  contentType: noticeContentTypeEnum;
  contentId: string;
  fileName: string;
  file: File | null;
  cursorIndex?: number;
}
export type ContentImagesResponse = ApiResponse<NoticeContentImages>;
