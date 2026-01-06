import { StatisticsEnum } from '../enum/statistics.enum';

export class ProductLogModel {
  public type!: StatisticsEnum;
  public url!: string;
  public ip!: string;
  public device!: string;
  public accountId?: number;
  public accountRoleId?: number;
  public productId?: number;
  public productMediaId?: number;
  constructor(props: ProductLogModel) {
    Object.assign(this, props);
  }
}
