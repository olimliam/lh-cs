import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { TourResponse } from '@/shared/model/tour.dto';
import { getAllTours, getTourById } from '../tour-query-api';

export const TOUR_QUERY_KEYS = {
  getAll: ['tours', 'list'],
  getById: (id: string) => ['tours', 'detail', id],
  create: ['tours', 'create'],
  update: (id: string) => ['tours', 'update', id],
  delete: (id: string) => ['tours', 'delete', id],
};

export const useGetAllTours = (): UseQueryResult<TourResponse[], Error> => {
  return useQuery<TourResponse[], Error>({
    queryKey: TOUR_QUERY_KEYS.getAll,
    queryFn: () => getAllTours(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useGetTourById = (
  id?: string
): UseQueryResult<TourResponse, Error> => {
  return useQuery<TourResponse, Error>({
    queryKey: TOUR_QUERY_KEYS.getById(id || ''),
    queryFn: () => getTourById(id!),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
};
