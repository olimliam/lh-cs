# 상담실 관리 시스템 (CQRS 패턴)

NestJS + TypeORM + MySQL 기반의 CQRS 패턴을 적용한 상담실 관리 시스템입니다.

## 📁 프로젝트 구조

```
src/
├── application/           # 애플리케이션 계층
│   ├── consultation.service.ts      # 비즈니스 로직 서비스
│   └── dto/                         # 데이터 전송 객체
│       ├── create-consultation.dto.ts
│       ├── consultation-response.dto.ts
│       ├── search-consultation.dto.ts
│       └── consultation-stats.dto.ts
├── infrastructure/       # 인프라 계층
│   ├── entity/                      # TypeORM 엔티티
│   │   ├── consultation.entity.ts
│   │   ├── consultation-history.entity.ts
│   │   ├── read-consultation.entity.ts
│   │   ├── user.entity.ts
│   │   ├── tour.entity.ts
│   │   └── facility.entity.ts
│   └── repository/                  # CQRS 리포지토리
│       ├── command/                 # 쓰기 전용
│       │   └── consultation-command.repository.ts
│       └── query/                   # 읽기 전용
│           └── consultation-query.repository.ts
├── presentation/         # 프레젠테이션 계층
│   └── consultation.controller.ts   # REST API 컨트롤러
└── module/              # 모듈 구성
    └── consultation.module.ts       # DI 설정
```

## 🏗️ CQRS 아키텍처

### Command Side (쓰기 작업)
- **ConsultationCommandRepository**: 상담실 생성, 수정, 삭제 담당
- **트랜잭션 관리**: 데이터 일관성 보장
- **이력 관리**: 모든 변경사항 추적

### Query Side (읽기 작업)  
- **ConsultationQueryRepository**: 검색, 조회, 통계 담당
- **읽기 최적화**: `read_consultations` 뷰 테이블 활용
- **성능 향상**: 인덱스 최적화 및 캐싱 지원

## 🗄️ 데이터베이스 설계

### 핵심 테이블
- `consultations`: 메인 상담실 정보
- `consultation_histories`: 상담 진행 이력
- `read_consultations`: 읽기 최적화 뷰 테이블
- `users`, `tours`, `facilities`: 연관 데이터

### 주요 인덱스
```sql
-- 성능 최적화 인덱스
CREATE INDEX idx_consultations_user_status ON consultations(user_id, status);
CREATE INDEX idx_consultations_enter_code ON consultations(enter_code);
CREATE INDEX idx_read_consultations_search ON read_consultations(user_id, status, created_at);
```

## 🚀 API 엔드포인트

### 상담실 관리
```typescript
POST   /api/v1/consultations           // 상담실 생성
PUT    /api/v1/consultations/:id/start  // 상담 시작
PUT    /api/v1/consultations/:id/end    // 상담 종료
```

### 상담실 조회
```typescript
GET    /api/v1/consultations/active      // 활성 상담실 목록
GET    /api/v1/consultations/stats       // 대시보드 통계
GET    /api/v1/consultations/search      // 상담실 검색
GET    /api/v1/consultations/enter/:code // 입장 코드로 찾기
GET    /api/v1/consultations/:id         // 상세 조회
```

## 📝 사용 예제

### 1. 상담실 생성
```typescript
const createDto: CreateConsultationDto = {
  roomName: "VIP 상담실",
  userId: 123,
  tourId: 456,
  startTourFacilityId: 789 // tour_facility_id
};

const consultation = await consultationService.createConsultation(createDto);
```

### 2. 상담 시작
```typescript
await consultationService.startConsultation(consultationId, {
  visitorId: "visitor_123"
});
```

### 3. 활성 상담실 조회
```typescript
const activeRooms = await consultationService.getAllActiveConsultations(userId);
```

### 4. 대시보드 통계
```typescript
const stats = await consultationService.getDashboardStats(userId);
// 결과: { totalActive: 5, waitingRooms: 3, consultingRooms: 2, ... }
```

## 🔧 설정 방법

### 1. 환경 변수 설정
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=consultation_db

# Application
NODE_ENV=development
PORT=3000
```

### 2. TypeORM 설정
```typescript
// app.module.ts
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
}),
```

### 3. 모듈 임포트
```typescript
// app.module.ts
@Module({
  imports: [
    ConsultationModule,
    // ... 다른 모듈들
  ],
})
export class AppModule {}
```

## 🧪 테스트

### Unit Test 예제
```typescript
describe('ConsultationService', () => {
  it('should create consultation', async () => {
    const createDto = { /* test data */ };
    const result = await service.createConsultation(createDto);
    
    expect(result).toBeDefined();
    expect(result.roomNumber).toBeDefined();
  });
});
```

### E2E Test 예제
```typescript
describe('ConsultationController (e2e)', () => {
  it('/consultations (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/consultations')
      .send(createConsultationDto)
      .expect(201);
  });
});
```

## 📊 성능 모니터링

### 로깅
- 모든 API 호출 로깅
- 데이터베이스 쿼리 성능 모니터링
- 에러 추적 및 알림

### 메트릭
- 상담실 생성/종료 횟수
- 평균 상담 시간
- 활성 사용자 수
- API 응답 시간

## 🔒 보안 고려사항

### 인증/인가
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsultationController {
  // JWT 토큰 기반 인증 필요
}
```

### 데이터 검증
```typescript
// DTO에서 validation 적용
@IsNotEmpty()
@IsString()
@Length(1, 100)
roomName: string;
```

### SQL Injection 방지
- TypeORM의 쿼리 빌더 사용
- 매개변수화된 쿼리 활용

## 🚀 배포 가이드

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### 환경별 설정
- **개발**: `NODE_ENV=development`
- **스테이징**: `NODE_ENV=staging`  
- **운영**: `NODE_ENV=production`

## 📚 추가 리소스

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 가이드](https://typeorm.io/)
- [CQRS 패턴 설명](https://docs.nestjs.com/recipes/cqrs)
- [MySQL 최적화 가이드](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

**담당자**: 개발팀  
**최종 업데이트**: 2024년 12월  
**버전**: 1.0.0
