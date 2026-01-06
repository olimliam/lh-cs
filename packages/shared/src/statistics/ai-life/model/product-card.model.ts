export class ProductCardModel {
  id!: number;
  productId!: number;
  title!: string;
  imageUrl!: string;
  cardMappedMediaId!: number;
  description?: string;
  count?: number;
  percent?: number;

  constructor(props: ProductCardModel) {
    Object.assign(this, props);
  }
}
