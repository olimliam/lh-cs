import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { PaginationReqDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetNotificationsRequest extends PaginationReqDto {
  @ApiPropertyOptional({
    description: '정렬 기준 컬럼',
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt'])
  override orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '공개 여부 필터',
    type: Boolean,
  })
  @IsBooleanAndBooleanString({ optional: true })
  isPublic?: boolean;
}
