import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('TBL_SUBMIT_QUEUE')
export class SmsQueueEntity {
  @PrimaryGeneratedColumn({
    name: 'cmp_msg_id',
    type: 'bigint',
    unsigned: true,
  })
  cmpMsgId: number;

  @Column({ name: 'cmp_msg_group_id', type: 'varchar', length: 20 })
  cmpMsgGroupId: string;

  @Column({ name: 'usr_id', type: 'varchar', length: 16 })
  usrId: string;

  @Column({ name: 'sms_gb', type: 'char', length: 1 })
  smsGb: string;

  @Column({ name: 'used_cd', type: 'char', length: 2 })
  usedCd: string;

  @Column({ name: 'reserved_fg', type: 'char', length: 1 })
  reservedFg: string;

  @Column({ name: 'reserved_dttm', type: 'char', length: 14 })
  reservedDttm: string;

  @Column({ name: 'saved_fg', type: 'char', length: 1, default: '0' })
  savedFg: string;

  @Column({ name: 'rcv_phn_id', type: 'varchar', length: 24 })
  rcvPhnId: string;

  @Column({ name: 'snd_phn_id', type: 'varchar', length: 24 })
  sndPhnId: string;

  @Column({ name: 'nat_cd', type: 'varchar', length: 8, nullable: true })
  natCd?: string;

  @Column({ name: 'assign_cd', type: 'char', length: 5, default: '00000' })
  assignCd: string;

  @Column({ name: 'snd_msg', type: 'varchar', length: 2000 })
  sndMsg: string;

  @Column({
    name: 'callback_url',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  callbackUrl?: string;

  @Column({ name: 'content_cnt', type: 'int', default: 0 })
  contentCnt: number;

  @Column({
    name: 'content_mime_type',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  contentMimeType?: string;

  @Column({
    name: 'content_path',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  contentPath?: string;

  @Column({ name: 'cmp_snd_dttm', type: 'char', length: 14 })
  cmpSndDttm: string;

  @Column({ name: 'cmp_rcv_dttm', type: 'char', length: 14, nullable: true })
  cmpRcvDttm?: string;

  @Column({ name: 'reg_snd_dttm', type: 'char', length: 14 })
  regSndDttm: string;

  @Column({ name: 'reg_rcv_dttm', type: 'char', length: 14, nullable: true })
  regRcvDttm?: string;

  @Column({ name: 'machine_id', type: 'char', length: 2, nullable: true })
  machineId?: string;

  @Column({ name: 'sms_status', type: 'char', length: 1 })
  smsStatus: string;

  @Column({ name: 'rslt_val', type: 'char', length: 4, nullable: true })
  rsltVal?: string;

  @Column({ name: 'msg_title', type: 'varchar', length: 200, nullable: true })
  msgTitle?: string;

  @Column({ name: 'telco_id', type: 'char', length: 4, nullable: true })
  telcoId?: string;

  @Column({ name: 'etc_char_1', type: 'varchar', length: 100, nullable: true })
  etcChar1?: string;

  @Column({ name: 'etc_char_2', type: 'varchar', length: 100, nullable: true })
  etcChar2?: string;

  @Column({ name: 'etc_char_3', type: 'varchar', length: 100, nullable: true })
  etcChar3?: string;

  @Column({ name: 'etc_char_4', type: 'varchar', length: 100, nullable: true })
  etcChar4?: string;

  @Column({ name: 'etc_int_5', type: 'int', nullable: true })
  etcInt5?: number;

  @Column({ name: 'etc_int_6', type: 'int', nullable: true })
  etcInt6?: number;
}
