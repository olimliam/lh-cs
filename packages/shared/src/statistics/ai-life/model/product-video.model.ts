export class ProductVideoModel {
  id!: number;
  productId!: number;
  title!: string;
  description!: string;
  url!: string;
  count?: number;
  percent?: number;

  constructor(props: ProductVideoModel) {
    Object.assign(this, props);
  }
}
