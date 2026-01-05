import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

class FacilityOrderItem {
  @ApiProperty({
    description: '투어 시설 ID',
    type: String,
    example: '1',
  })
  @IsNotEmpty()
  @Type(() => String)
  id: string;

  @ApiProperty({
    description: '표시 순서',
    type: Number,
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displayOrder: number;
}

/**
 * 투어 시설 순서 변경 요청 DTO (Presentation Layer)
 */
export class ReorderTourFacilitiesRequest {
  @ApiProperty({
    description: '순서 변경할 시설 목록',
    type: [FacilityOrderItem],
    example: [
      { id: '1', displayOrder: 1 },
      { id: '2', displayOrder: 2 },
      { id: '3', displayOrder: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityOrderItem)
  facilities: FacilityOrderItem[];
}
