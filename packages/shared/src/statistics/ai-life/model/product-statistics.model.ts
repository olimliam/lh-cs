import { StatisticsEnum } from '../enum';

export class ProductStatisticsModel {
  type!: StatisticsEnum;
  clickCount!: number;
  accountId!: number;
  accountRoleId!: number;
  productId!: number;
  productMediaId!: number;
  rankCount?: number;

  constructor(props: ProductStatisticsModel) {
    Object.assign(this, {
      ...props,
      accountId: props.accountId,
      accountRoleId: props.accountRoleId,
      productId: props.productId!,
      productMediaId: props.productMediaId!,
      rankCount: props.rankCount || 0,
    });
  }
}
