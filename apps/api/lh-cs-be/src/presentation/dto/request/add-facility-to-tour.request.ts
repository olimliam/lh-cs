import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

/**
 * 투어에 시설 추가 요청 DTO (Presentation Layer)
 */
export class AddFacilityToTourRequest {
  @ApiProperty({
    description: '시설 ID',
    type: String,
    example: '1',
  })
  @IsNotEmpty()
  @Type(() => String)
  facilityId: string;

  @ApiProperty({
    description: 'Scene ID',
    type: String,
    example: '3',
  })
  @IsNotEmpty()
  @Type(() => String)
  sceneId: string;

  @ApiProperty({
    description: '카메라 포지션 X',
    type: Number,
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cameraPosX?: number;

  @ApiProperty({
    description: '카메라 포지션 Y',
    type: Number,
    example: 1.8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cameraPosY?: number;

  @ApiProperty({
    description: '카메라 포지션 Z',
    type: Number,
    example: 0.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cameraPosZ?: number;

  @ApiProperty({
    description: '기본 시작 위치 여부',
    type: Boolean,
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefaultStart?: boolean;

  @ApiProperty({
    description: '표시 순서',
    type: Number,
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;
}
