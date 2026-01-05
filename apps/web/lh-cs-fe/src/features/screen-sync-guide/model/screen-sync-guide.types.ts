export interface ScreenSyncStep {
  id: number;
  title: string;
  description: React.ReactNode;
  imageSrc?: string;
  caption?: React.ReactNode;
}

export interface ScreenSyncGuideButtonLabels {
  skip: string;
  previous: string;
  next: string;
  confirm: string;
}
