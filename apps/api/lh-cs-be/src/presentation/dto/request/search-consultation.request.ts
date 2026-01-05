import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ConsultationStatus } from '@/infrastructure/repository/entity';
import { SearchConsultationQuery } from '@/application/dto/query';

export class SearchConsultationRequest {
  @ApiPropertyOptional({ description: '상담실 번호 (부분 검색)', example: '1234' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({
    description: '상담실 상태',
    enum: ConsultationStatus,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiPropertyOptional({ description: '투어 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  tourId?: number;

  @ApiPropertyOptional({ description: '검색 시작 날짜', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '검색 종료 날짜', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  limit?: number;

  @ApiPropertyOptional({ description: '페이지 오프셋', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  offset?: number;

  toQuery(): SearchConsultationQuery {
    return {
      roomNumber: this.roomNumber,
      status: this.status,
      tourId: this.tourId !== undefined ? `${this.tourId}` : undefined,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.limit,
      offset: this.offset,
    };
  }
}
