import { TOTAL_PRODUCT_COUNT } from '../constants/statistics.constant';

export class ExcelContentModel {
  id: number | string;
  title: string;
  avg: number;
  total: number;

  constructor(data: ExcelContentModel) {
    this.id = data.id;
    this.title = data.title;
    this.avg = Math.round(data.avg / TOTAL_PRODUCT_COUNT);
    this.total = data.total;
  }
}
