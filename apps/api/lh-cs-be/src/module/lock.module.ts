// src/infrastructure/lock/lock.module.ts
import { MySqlNamedLock } from '@/infrastructure/lock/my-sql-named-lock';
import { Module } from '@nestjs/common';

@Module({
  providers: [MySqlNamedLock],
  exports: [MySqlNamedLock],
})
export class LockModule {}
