import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ResetPasswordRequest {
  @ApiPropertyOptional({
    description: `비밀번호 초기화 사유 - 관리자 로그 및 사용자 알림에 사용
    
**예시 사유:**
- 사용자 요청에 의한 임시 비밀번호 발급
- 보안 위반으로 인한 계정 보호
- 계정 잠금 해제를 위한 초기화
- 시스템 마이그레이션으로 인한 일괄 초기화`,
    example: '사용자 요청에 의한 임시 비밀번호 발급',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: `생성할 비밀번호 길이 (8-20자, 기본 12자)
    
**권장 길이:**
- 8-10자: 기본 보안 (strength: 2-3)
- 11-14자: 강화 보안 (strength: 4)  
- 15-20자: 최고 보안 (strength: 5)
    
**자동 보장 요소:**
- 대문자 최소 1개
- 소문자 최소 1개  
- 숫자 최소 1개
- 특수문자 최소 1개`,
    example: 12,
    minimum: 8,
    maximum: 20,
    default: 12,
  })
  @IsInt()
  @Min(8)
  @Max(20)
  @IsOptional()
  passwordLength?: number;
}
