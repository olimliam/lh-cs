import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SmsQueueRepository } from '@/infrastructure/repository/sms-queue.repository';
import { SmsErrorCode } from '@/common/exception/error/sms-error-code.enum';
import { CustomException } from '@/common/exception/custom.exception';
import smsConfig from '@/config/sms.config';
import { formatTimestamp } from '@/common/utils/date.util';

@Injectable()
export class SmsQueueService {
  constructor(
    private readonly smsQueueRepository: SmsQueueRepository,
    @Inject(smsConfig.KEY)
    private readonly smsConfigValues: ConfigType<typeof smsConfig>
  ) {}

  async sendVerificationCode(
    recipientPhone: string,
    code: string
  ): Promise<void> {
    const senderPhone = this.smsConfigValues.senderPhone?.replace(
      /[^0-9]/g,
      ''
    );
    const agentId = this.smsConfigValues.agentId?.trim();

    if (!senderPhone || !agentId) {
      throw new CustomException(
        SmsErrorCode.SMS_SENDER_NOT_CONFIGURED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const normalizedRecipient = recipientPhone.replace(/[^0-9]/g, '');
    const now = new Date();
    const timestamp = formatTimestamp(now);

    await this.smsQueueRepository.enqueue({
      cmpMsgGroupId: '0',
      usrId: agentId,
      smsGb: '1',
      usedCd: '00',
      reservedFg: 'I',
      reservedDttm: timestamp,
      savedFg: '0',
      rcvPhnId: normalizedRecipient,
      sndPhnId: senderPhone,
      natCd: null,
      assignCd: '00000',
      sndMsg: this.buildMessage(code),
      callbackUrl: null,
      contentCnt: 0,
      contentMimeType: null,
      contentPath: null,
      cmpSndDttm: timestamp,
      cmpRcvDttm: null,
      regSndDttm: timestamp,
      regRcvDttm: null,
      machineId: null,
      smsStatus: '0',
      rsltVal: null,
      msgTitle: null,
      telcoId: null,
      etcChar1: null,
      etcChar2: null,
      etcChar3: null,
      etcChar4: null,
      etcInt5: 0,
      etcInt6: 0,
    });
  }

  private buildMessage(code: string): string {
    return `[LH] 본인확인 인증번호는 [${code}]입니다. 타인에게 노출되지 않도록 주의하세요.`;
  }

}
