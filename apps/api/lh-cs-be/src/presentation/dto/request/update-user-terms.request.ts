import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserTermsCommand } from '@/application/dto/command/update-user-terms.command';

export class UserTermAgreementRequest {
  @ApiProperty({ description: '약관 ID', example: '1' })
  @IsString()
  termsId: string;

  @ApiProperty({ description: '동의 여부', example: true })
  @IsBoolean()
  agreed: boolean;
}

export class UpdateUserTermsRequest {
  @ApiProperty({
    description: '동의 상태 목록',
    type: [UserTermAgreementRequest],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => UserTermAgreementRequest)
  terms: UserTermAgreementRequest[];

  toCommand(userId: string): UpdateUserTermsCommand {
    return new UpdateUserTermsCommand(userId, this.terms);
  }
}
