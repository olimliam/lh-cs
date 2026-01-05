import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LoginAllowedIpHistoryAction,
  LoginAllowedIpHistoryEntity,
} from './entity/login-allowed-ip-history.entity';

export interface LoginAllowedIpHistoryRecordInput {
  loginAllowedIpId: string;
  ipAddress: string;
  description?: string | null;
  isActive: boolean;
  action: LoginAllowedIpHistoryAction;
  changedBy: string;
}

@Injectable()
export class LoginAllowedIpHistoryRepository {
  constructor(
    @InjectRepository(LoginAllowedIpHistoryEntity)
    private readonly repository: Repository<LoginAllowedIpHistoryEntity>
  ) {}

  async record(
    params: LoginAllowedIpHistoryRecordInput
  ): Promise<LoginAllowedIpHistoryEntity> {
    const entity = this.repository.create({
      loginAllowedIpId: params.loginAllowedIpId,
      ipAddress: params.ipAddress,
      description:
        params.description === undefined ? null : params.description ?? null,
      isActive: params.isActive,
      action: params.action,
      changedBy: params.changedBy,
    });

    return this.repository.save(entity);
  }
}
