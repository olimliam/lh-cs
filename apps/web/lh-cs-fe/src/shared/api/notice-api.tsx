import {
  GetPaginationFilterParams,
  RequestCreateNoticeFaq,
  RequestUpdateNoticeFaq,
} from '@/shared/model/notice-faq-type';
import {
  ContentImagesResponse,
  CreateNoticeFaqResponse,
  GetTotalNoticeFaqResponse,
  GetNoticeFaqResponseById,
  RequestContentImages,
} from '../model/notice-api-type';
import { publicApi } from './public-api-client';
import { api } from './api-client';

export async function getNotice(
  params: GetPaginationFilterParams
): Promise<GetTotalNoticeFaqResponse> {
  const { page, limit, orderBy, orderDirection, isPublic } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (orderBy) queryParams.append('orderBy', orderBy);
  if (orderDirection) queryParams.append('orderDirection', orderDirection);
  if (isPublic !== undefined) queryParams.append('isPublic', String(isPublic));

  const { data: response } = await publicApi.get<GetTotalNoticeFaqResponse>(
    `/notifications?${queryParams.toString()}`
  );
  return response;
}

export async function postNotice(
  request: RequestCreateNoticeFaq
): Promise<CreateNoticeFaqResponse> {
  const formData = new FormData();
  formData.append('title', request.title);
  formData.append('content', request.content);
  formData.append('isPublic', String(request.isPublic));
  if (request.attachmentNames && request.attachmentNames.length > 0) {
    formData.append('attachmentNames', JSON.stringify(request.attachmentNames));
  }
  formData.append('contentImageRefs', JSON.stringify(request.contentImageRefs));
  if (request.attachments && request.attachments.length > 0) {
    request.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }
  const { data: response } = await api.post<CreateNoticeFaqResponse>(
    '/notifications',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600_000, // 대용량 첨부 대비 업로드 타임아웃 600초
    }
  );
  if (response) {
    return response;
  }

  throw new Error('Failed to create Notice');
}

export async function getNoticeById(
  id: number
): Promise<GetNoticeFaqResponseById> {
  const queryParams = new URLSearchParams();
  queryParams.append('id', id.toString());

  const { data: response } = await publicApi.get<GetNoticeFaqResponseById>(
    `/notifications/${id}`
  );
  return response;
}

export async function updateNoticeById(
  id: string,
  request: RequestUpdateNoticeFaq
): Promise<CreateNoticeFaqResponse> {
  const formData = new FormData();
  formData.append('title', request.title);
  formData.append('content', request.content);
  formData.append('isPublic', String(request.isPublic));
  if (request.removeExistingFiles !== undefined)
    formData.append('removeExistingFiles', String(request.removeExistingFiles));
  if (request.attachmentNames && request.attachmentNames.length > 0) {
    formData.append('attachmentNames', JSON.stringify(request.attachmentNames));
  }
  if (request.contentImageRefs && request.contentImageRefs.length > 0) {
    formData.append(
      'contentImageRefs',
      JSON.stringify(request.contentImageRefs)
    );
  }
  if (
    request.attachmentIdsToRemove &&
    request.attachmentIdsToRemove.length > 0
  ) {
    formData.append(
      'attachmentIdsToRemove',
      JSON.stringify(request.attachmentIdsToRemove)
    );
  }
  if (request.attachments && request.attachments.length > 0) {
    request.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const { data: response } = await api.put<CreateNoticeFaqResponse>(
    `/notifications/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600_000, // 대용량 첨부 대비 업로드 타임아웃 600초
    }
  );
  if (response) {
    return response;
  }

  throw new Error('Failed to update Notice');
}

export async function uploadContentImages(
  request: RequestContentImages
): Promise<ContentImagesResponse> {
  const formData = new FormData();
  formData.append('contentType', request.contentType);
  if (request.contentId !== undefined)
    formData.append('contentId', request.contentId);
  if (request.fileName !== undefined)
    formData.append('fileName', request.fileName);
  if (request.file !== undefined && request.file !== null)
    formData.append('file', request.file);

  const { data: response } = await api.post<ContentImagesResponse>(
    `/content-images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  if (response) {
    return response;
  }

  throw new Error('Failed to upload content images');
}
