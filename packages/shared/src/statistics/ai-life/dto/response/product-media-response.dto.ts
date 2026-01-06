import { ProductVideoModel } from '../../model/product-video.model';

export class ProductMediaResponseDto {
  constructor(public videoList: ProductMediaDto[]) {}

  static fromDomain(domains: ProductVideoModel[]): ProductMediaResponseDto {
    return new ProductMediaResponseDto(
      domains.map((domain) => ProductMediaDto.fromDomain(domain))
    );
  }
}

export class ProductMediaDto {
  constructor(
    public id: number,
    public title: string,
    public url: string,
    public count: number,
    public percent: number
  ) {}

  static fromDomain(domain: ProductVideoModel): ProductMediaDto {
    return new ProductMediaDto(
      domain.id,
      domain.title,
      domain.url,
      domain.count || 0,
      domain.percent || 0
    );
  }
}
