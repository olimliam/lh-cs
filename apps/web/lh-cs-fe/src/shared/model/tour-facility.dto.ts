import { FacilityTypeEnum } from '@/shared/model/facility-type.enum';

export interface TourFacilityResponse {
  id: string;
  tourId: string;
  facilityId: string;
  facilityTitle: string;
  facilityDescription?: string;
  sceneId: string;
  cameraPosX?: number;
  cameraPosY?: number;
  cameraPosZ?: number;
  isDefaultStart: boolean;
  displayOrder: number;
  isActive: boolean;
  type: FacilityTypeEnum;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTourFacilityRequest {
  sceneId?: string;
  cameraPosX?: number;
  cameraPosY?: number;
  cameraPosZ?: number;
  isDefaultStart?: boolean;
  displayOrder?: number;
}
