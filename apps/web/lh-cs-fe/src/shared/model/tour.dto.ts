export interface TourResponse {
  id: string;
  tourCdnId: string;
  squareMeters: number;
  title: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
