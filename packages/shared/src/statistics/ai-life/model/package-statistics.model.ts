import { StatisticsEnum } from '../enum/statistics.enum';

export class PackageStatisticsModel {
  constructor(
    public type: StatisticsEnum,
    public clickCount: number,
    public accountId: number,
    public accountRoleId: number,
    public packageId: number,
    public packageMediaId: number,
    public rankCount?: number
  ) {}
}
