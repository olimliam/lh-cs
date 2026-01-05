import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

export const createSwaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('투어 상담 시스템 API')
    .setDescription(
      `부동산 투어 상담 시스템을 위한 RESTful API

## 주요 기능
- **사용자 계정 관리**: 회원가입, 로그인, 프로필 관리
- **관리자 기능**: 사용자 관리, 비밀번호 초기화, 권한 관리
- **보안 기능**: JWT 인증, 비밀번호 정책, CSRF 보호
- **파일 업로드**: S3 기반 프로필 이미지 관리
- **비밀번호 관리**: 강력한 비밀번호 정책, 자동 초기화
- **약관 동의 관리**: 필수/선택 약관 배포 및 사용자 동의 추적

## 비밀번호 정책
- 최소 8자, 최대 20자
- 대문자, 소문자, 숫자, 특수문자 각각 최소 1개 포함
- 일반적인 패턴 금지 (password, 123456 등)
- 강도 평가 시스템 (1-5단계)`
    )
    .setVersion('1.0.6')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
        in: 'header',
      },
      'bearer'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          '비전AI 외부 창 임시 토큰(EPT) - /external/v1/vision-ai/redeem 호출용',
      },
      'ept-token'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          '비전AI 외부 창 세션 토큰(ST) - /external/v1/vision-ai/profile 호출용',
      },
      'redeem-token'
    )
    .addTag('Admin - Users', '관리자 전용 사용자 관리 API')
    .addTag('Auth', '인증 및 계정 관리 API')
    .addTag('Users', '사용자 기본 기능 API')
    .addTag('External Vision AI', '비전AI 외부 창 전용 API')
    .build();

export const swaggerDocumentOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  deepScanRoutes: true,
};

export const swaggerCustomOptions: SwaggerCustomOptions = {
  useGlobalPrefix: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b82f6; }
  `,
  customSiteTitle: '투어 상담 시스템 API 문서',
};
