import { StatisticsEnum } from '../enum/statistics.enum';

export class CreateClickLogInfoDto {
  type!: StatisticsEnum;
  ip!: string;
  device!: string;
  url!: string;
  id?: number;
  mediaId?: number;
  accountId?: number;
  accountRoleId?: number;
  constructor(props: CreateClickLogInfoDto) {
    Object.assign(this, props);
  }
}
