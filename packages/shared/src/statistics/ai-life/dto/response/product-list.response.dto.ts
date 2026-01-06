import { ProductModel } from '../../model/product.model';

export class ProductListResponseDto {
  constructor(public productList: ProductResponseDto[]) {}

  static fromDomain(products: ProductModel[]): ProductListResponseDto {
    const productList = products.map((product) =>
      ProductResponseDto.fromDomain(product)
    );
    return new ProductListResponseDto(productList);
  }
}

export class ProductResponseDto {
  constructor(
    public id: number,
    public name: string,
    public imageUrl: string,
    public description?: string,
    public count?: number,
    public percent?: number
  ) {}

  static fromDomain(product: ProductModel): ProductResponseDto {
    return new ProductResponseDto(
      product.id,
      product.name,
      product.imageUrl,
      product.description,
      product.count ? Number(product.count) : 0,
      product.percent ? Number(product.percent) : 0
    );
  }
}
