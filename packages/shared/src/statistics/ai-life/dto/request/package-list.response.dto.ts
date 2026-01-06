import { PackageModel } from '../../model/package.model';

export class PackageListResponseDto {
  constructor(public packageList: PackageResponseDto[]) {}

  static fromDomain(domains: PackageModel[]): PackageListResponseDto {
    return new PackageListResponseDto(
      domains.map((domain) => PackageResponseDto.fromDomain(domain))
    );
  }
}

export class PackageResponseDto {
  constructor(
    public id: number,
    public name: string,
    public imageUrl: string,
    public count: number,
    public percent: number
  ) {}

  static fromDomain(domain: PackageModel): PackageResponseDto {
    return new PackageResponseDto(
      domain.id,
      domain.name,
      domain.imageUrl,
      domain.count || 0,
      domain.percent || 0
    );
  }
}
