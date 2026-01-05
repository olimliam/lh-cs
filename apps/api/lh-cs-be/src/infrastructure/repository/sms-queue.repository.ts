import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsQueueEntity } from './entity/sms-queue.entity';
import { CustomException } from '@/common/exception/custom.exception';
import { SmsErrorCode } from '@/common/exception/error/sms-error-code.enum';

@Injectable()
export class SmsQueueRepository {
  private readonly logger = new Logger(SmsQueueRepository.name);

  constructor(
    @InjectRepository(SmsQueueEntity)
    private readonly repo: Repository<SmsQueueEntity>
  ) {}

  async enqueue(payload: Partial<SmsQueueEntity>): Promise<void> {
    try {
      const entity = this.repo.create(payload);
      await this.repo.save(entity);
    } catch (error) {
      this.logger.error('sms queue 저장에 실패했습니다.', error);
      throw new CustomException(
        SmsErrorCode.SMS_QUEUE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
