export type MapSize = 'sm' | 'md' | 'lg';
export type PointType = 'star' | 'module';

export interface ModelInfo {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}

export interface PointAbstractInfo {
  type: PointType;
  id: number;
  title: string;
  // moduleType?: EditorModuleType;
}

export interface PointInfo extends PointAbstractInfo {
  x: number;
  y: number;
}
