import { Slide } from '@/common/types/whiteboard.type';

export class CacheWhiteboardRequestDto {
  spaceId!: string;
  slideList!: Slide[];
}
