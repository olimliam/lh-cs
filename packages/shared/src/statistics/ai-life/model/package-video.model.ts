export class PackageVideoModel {
  constructor(
    public id: number,
    public packageId: number,
    public title: string,
    public description: string,
    public url: string,
    public count?: number,
    public percent?: number
  ) {}
}
