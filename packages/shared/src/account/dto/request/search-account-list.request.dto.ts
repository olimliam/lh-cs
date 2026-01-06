import { ExcelContentModel } from '@/statistics';

export class SearchAccountListRequestDto {
  content: ExcelContentModel[];

  constructor(dto: SearchAccountListRequestDto) {
    this.content = dto.content;
  }
}
