import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDataResponse {
  @ApiProperty({
    description: `생성된 임시 비밀번호 - 보안 정책을 모두 만족하는 랜덤 비밀번호
    
**보안 특징:**
- 대문자, 소문자, 숫자, 특수문자 각각 최소 1개 포함
- 예측 불가능한 패턴으로 생성
- 일반적인 취약 패턴 배제
- 문자열 무작위 섞기 적용
    
**⚠️ 보안 주의사항:**
- 생성 즉시 사용자에게 안전한 방법으로 전달
- 로그 파일에 평문 저장 금지
- 임시 비밀번호는 첫 로그인 시 변경 권장`,
    example: 'Kx9#mP2vQ8wR!n',
  })
  temporaryPassword: string;

  @ApiProperty({
    description: `비밀번호 강도 레벨 (1-5)
    
**강도 기준:**
- 1: 매우 약함 (기본 요구사항만 충족)
- 2: 약함 (8-10자, 기본 복잡성)
- 3: 보통 (11-12자, 중간 복잡성)
- 4: 강함 (13-16자, 높은 복잡성)
- 5: 매우 강함 (17자 이상, 최고 복잡성)`,
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  passwordStrength: number;

  @ApiProperty({
    description: `비밀번호 강도 설명 (한국어)
    
**가능한 값:**
- "매우 약함" (strength: 1)
- "약함" (strength: 2)  
- "보통" (strength: 3)
- "강함" (strength: 4)
- "매우 강함" (strength: 5)`,
    example: '매우 강함',
    enum: ['매우 약함', '약함', '보통', '강함', '매우 강함'],
  })
  passwordStrengthText: string;

  @ApiProperty({
    description: '비밀번호 초기화 수행 시간 (ISO 8601 형식)',
    example: '2025-09-23T12:00:00.000Z',
    format: 'date-time',
  })
  resetAt: string;
}

export class ResetPasswordResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Password reset successfully',
  })
  message: string;

  @ApiProperty({
    description: '비밀번호 초기화 결과',
    type: ResetPasswordDataResponse,
  })
  data: ResetPasswordDataResponse;
}
