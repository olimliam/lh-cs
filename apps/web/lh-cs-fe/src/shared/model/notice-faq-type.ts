export interface NoticeFaqItemData {
  id: string;
  title: string;
  content: string;
  fileUrl?: string | null; //작업 끝나면 삭제
  fileName?: string | null; //작업 끝나면 삭제
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  createdBy: string;
  updatedBy: string;
}
export interface RequestCreateNoticeFaq {
  title: string;
  content: string;
  isPublic: boolean;
  fileName?: string | null; // 작업 끝난 후 삭제
  attachmentNames: string[];
  contentImageRefs: string[];
  attachments: File[] | null;
}

export interface RequestUpdateNoticeFaq extends RequestCreateNoticeFaq {
  removeExistingFiles: boolean;
  attachmentIdsToRemove: string[];
}
export interface GetPaginationFilterParams {
  page: number;
  limit: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'ASC' | 'DESC';
  isPublic?: boolean;
}
