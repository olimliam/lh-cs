import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RegisterAccountDto } from '../register-account.dto';

export class RegisterAccountRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterAccountDto)
  @ApiProperty({
    type: [RegisterAccountDto],
    description: 'List of accounts to be registered',
  })
  accountList: RegisterAccountDto[];

  constructor(dto: RegisterAccountRequestDto) {
    this.accountList = dto.accountList;
  }
}
