import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getAllTourFacilities,
  getAllTourFacilitiesByCdnId,
  getTourFacilityById,
} from '../tour-facility-query-api';

export const TOUR_FACILITIES_QUERY_KEYS = {
  getAll: ['tourFacilities', 'list'],
  getAllByCdnId: (cdnId: string) => ['tourFacilities', 'list', 'cdn', cdnId],
  getById: (id: string) => ['tourFacilities', 'detail', id],
  create: ['tourFacilities', 'create'],
  update: (id: string) => ['tourFacilities', 'update', id],
  delete: (id: string) => ['tourFacilities', 'delete', id],
};

import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';

export const useGetAllTourFacilities = (
  tourId?: string
): UseQueryResult<TourFacilityResponse[], Error> => {
  return useQuery<TourFacilityResponse[], Error>({
    queryKey: ['tourFacilities', 'list', tourId],
    queryFn: () => getAllTourFacilities(tourId!),
    enabled: !!tourId,
  });
};

export const useGetAllTourFacilitiesByCdnId = (
  tourCdnId?: string
): UseQueryResult<TourFacilityResponse[], Error> => {
  return useQuery<TourFacilityResponse[], Error>({
    queryKey: TOUR_FACILITIES_QUERY_KEYS.getAllByCdnId(tourCdnId || ''),
    queryFn: () => getAllTourFacilitiesByCdnId(tourCdnId!),
    enabled: !!tourCdnId,
  });
};


export const useGetTourFacilityById = (
  tourId?: string,
  facilityId?: string
): UseQueryResult<TourFacilityResponse, Error> => {
  return useQuery<TourFacilityResponse, Error>({
    queryKey: ['tourFacilities', 'detail', tourId, facilityId],
    queryFn: () => getTourFacilityById(tourId!, facilityId!),
    enabled: !!tourId && !!facilityId,
  });
};
