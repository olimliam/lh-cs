import { v4 as uuidv4 } from 'uuid';
import { DrawInfo } from './whiteboard.types';
import { DEFAULT_DB_DATA } from './whiteboard.constants';

export class SlideItemDto {
  id: string;
  isSelected: boolean;
  drawStack: DrawInfo[][];
  redoStack: DrawInfo[][];
  thumbnail?: string;
  image?: string;

  // 생성자 수정: dto를 기반으로 값 초기화
  constructor(dto?: Partial<SlideItemDto>) {
    this.id = dto?.id || uuidv4(); // 기본값: uuidv4
    this.isSelected = dto?.isSelected || false;
    this.thumbnail = dto?.thumbnail || DEFAULT_DB_DATA; // 기본값: defaultBgData
    this.drawStack = dto?.drawStack || []; // 기본값: 빈 배열
    this.redoStack = dto?.redoStack || []; // 기본값: 빈 배열
    this.image = dto?.image || DEFAULT_DB_DATA; // 기본값: defaultBgData
  }
}
