export class ProductModel {
  id!: number;
  name!: string;
  imageUrl!: string;
  description?: string;
  count?: number;
  percent?: number;

  constructor(props: ProductModel) {
    Object.assign(this, props);
  }
}
