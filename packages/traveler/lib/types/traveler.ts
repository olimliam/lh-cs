export interface MoveToTargetSpotOptions {
  isWarp?: boolean;
  isOriginalRotation?: boolean;
}

export interface RemotePointerState {
  userId: string;
  x: number; // 0~1 normalized
  y: number; // 0~1 normalized
  visible: boolean;
  updatedAt: number;
  action?: 'move' | 'click';
}
