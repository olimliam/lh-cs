import { UserRole } from '@/features/drawer/model/whiteboard.types';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';

export type TourMode = 'guide' | 'view' | 'admin';

export interface TourNavigationControlsOptions {
  drawingTool?: {
    show?: boolean;
    disabled?: boolean;
  };
  operationTime?: {
    show?: boolean;
    label?: string;
  };
  locationControl?: {
    show?: boolean;
    disabled?: boolean;
  };
  cameraSettings?: {
    show?: boolean;
    disabled?: boolean;
  };
  exitButton?: {
    show?: boolean;
    disabled?: boolean;
    confirmBeforeExit?: boolean;
  };
}

export interface TourNavigationProps {
  // Mode controls
  userRole?: UserRole;
  consultationId?: string;

  userId?: string;

  // UI props
  className?: string;
  disabled?: boolean;
  runningTime?: Date;
  isDrawingMode: boolean;
  isShow?: boolean;
  tourId?: string;

  // Controls visibility options
  options?: TourNavigationControlsOptions;

  // WebSocket props
  onEmitMessage?: (event: string, message: string) => void;
  toggleDrawMode: (isDrawing?: boolean) => void;
  onClickLocation?: (facility: TourFacilityResponse) => void;
  // Camera angle editing props
  isCameraEditMode?: boolean;
  onToggleCameraEditMode?: () => void;
  currentSceneId?: number;

  onToggleShowPositionControls: () => void;
  showPositionControls: boolean;
}
