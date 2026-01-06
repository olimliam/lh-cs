import { api } from '@/shared/api/api-client';
import { TourResponse } from '../model/tour.dto';

export async function getAllTours(): Promise<TourResponse[]> {
  // Implementation for fetching all tours
  const { data: response } = await api.get(`tours`);

  if (response) {
    return response.data;
  }

  throw new Error('Failed to fetch all tours');
}

export async function getTourById(id: string): Promise<TourResponse> {
  console.log('tour id:', id);
  const { data: response } = await api.get(`tours/${id}`);

  if (response?.data) {
    return response.data;
  }

  throw new Error('Failed to fetch tour detail');
}
