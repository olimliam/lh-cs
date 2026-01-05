export enum SceneImportStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

export interface SceneImportDetail {
  rowIndex: number;
  sequence?: string;
  facilityTitle: string;
  tourName: string;
  tourSquareMeters: number;
  sceneId?: string;
  url?: string;
  message: string;
  status: SceneImportStatus;
  tourId?: string;
  facilityId?: string;
  tourFacilityId?: string;
  previousSceneId?: string;
  metadata?: Record<string, unknown>;
}

export interface TourFacilitySceneImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  successes: SceneImportDetail[];
  failures: SceneImportDetail[];
  pending: SceneImportDetail[];
}
