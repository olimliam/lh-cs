export class StatisticsWithRangeResponseDto {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public count: number,
    public percent: number,
    public videoStatistics: VideoStatisticsWithRangeResponseDto[]
  ) {}
}

export class VideoStatisticsWithRangeResponseDto {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public count: number,
    public percent: number
  ) {}
}
