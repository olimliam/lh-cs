import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CustomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'create_date', type: 'timestamp' })
  createDate!: Date;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamp' })
  updateDate!: Date;
}
