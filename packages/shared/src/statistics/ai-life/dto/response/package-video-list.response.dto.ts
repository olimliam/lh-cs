import { PackageVideoModel } from '../../model';

export class PackageVideoListResponseDto {
  constructor(public videoList: PackageVideoResponseDto[]) {}

  static fromDomain(domains: PackageVideoModel[]): PackageVideoListResponseDto {
    return new PackageVideoListResponseDto(
      domains.map((domain) => PackageVideoResponseDto.fromDomain(domain))
    );
  }
}

export class PackageVideoResponseDto {
  constructor(
    public videoId: number,
    public packageId: number,
    public title: string,
    public url: string,
    public count: number,
    public percent: number
  ) {}

  static fromDomain(domain: PackageVideoModel): PackageVideoResponseDto {
    return new PackageVideoResponseDto(
      domain.id,
      domain.packageId,
      domain.title,
      domain.url,
      domain.count || 0,
      domain.percent || 0
    );
  }
}
