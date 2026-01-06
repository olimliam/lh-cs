import { api } from '@/shared/api/api-client';
import {
  TourFacilityResponse,
  UpdateTourFacilityRequest,
} from '../model/tour-facility.dto';

export async function getAllTourFacilities(
  tourId: string
): Promise<TourFacilityResponse[]> {
  // Implementation for fetching tour facilities
  const { data: response } = await api.get(`tours/${tourId}/facilities`);

  if (!response?.success) {
    throw new Error(response?.message || 'Failed to fetch tour facilities');
  }

  return response.data ?? [];
}

export async function getAllTourFacilitiesByCdnId(
  tourCdnId: string
): Promise<TourFacilityResponse[]> {
  // Implementation for fetching tour facilities by CDN ID
  const { data: response } = await api.get(`tours/cdn/${tourCdnId}/facilities`);
  console.log(tourCdnId);

  if (!response?.success) {
    throw new Error(
      response?.message || 'Failed to fetch tour facilities by CDN ID'
    );
  }

  return response.data ?? [];
}

export async function updateTourFacility(
  tourId: string,
  facilityId: string,
  updateData: UpdateTourFacilityRequest
): Promise<TourFacilityResponse> {
  // Implementation for updating tour facility camera position
  const { data: response } = await api.put(
    `tours/${tourId}/facilities/${facilityId}`,
    updateData
  );

  if (!response?.success) {
    throw new Error(response?.message || 'Failed to update tour facility');
  }

  return response.data;
}

export async function getTourFacilityById(
  tourId: string,
  facilityId: string
): Promise<TourFacilityResponse> {
  const { data: response } = await api.get(
    `tours/${tourId}/facilities/${facilityId}`
  );

  if (!response?.success) {
    throw new Error(
      response?.message || 'Failed to fetch tour facility detail'
    );
  }

  return response.data;
}
