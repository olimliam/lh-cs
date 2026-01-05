# 투어 시설 관리 시스템 데이터베이스 설계

## 📋 개요

로그인 허면에서 ID/PW 입력을 통한 사체 로그인 프로세스와 거치지 않고, 다음
단계로 넘어가는 상담실 만들기 시스템의 데이터베이스 설계입니다.

## � **ID 네이밍 규칙**

### **Primary Key 규칙**

- 모든 테이블의 Primary Key는 `id`로 통일
- 타입: `BIGINT AUTO_INCREMENT`
- 예시: `users.id`, `tours.id`, `facilities.id`

### **Foreign Key 규칙**

- `{참조테이블명}_id` 형식 사용
- 예시: `user_id`, `tour_id`, `facility_id`
- 복합 참조: `start_tour_facility_id`, `end_tour_facility_id`

자세한 네이밍 규칙은
[database-id-naming-convention.md](../../../docs/database-id-naming-convention.md)
참조

## �🏛️ 아키텍처 설계

### CQRS + Multi Datasource Repository Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│                Repository Layer                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Command Repository │    │     Query Repository        │ │
│  │   (Write Operations) │    │   (Read Operations)         │ │
│  │                     │    │                             │ │
│  │ - CREATE           │    │ - SELECT (Complex)          │ │
│  │ - UPDATE           │    │ - JOIN Operations           │ │
│  │ - DELETE           │    │ - Aggregations              │ │
│  │ - 트랜잭션 처리    │    │ - 읽기 최적화               │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                Multi Datasource Layer                       │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │     WriteDB         │    │       ReadDB                │ │
│  │   (Master DB)       │    │    (Slave DB/View)          │ │
│  │                     │    │                             │ │
│  │ - 트랜잭션 안전성   │    │ - 읽기 성능 최적화          │ │
│  │ - 데이터 일관성     │    │ - 복잡한 JOIN 쿼리          │ │
│  │ - 무결성 보장       │    │ - 집계 및 통계              │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 설계 원칙

1. **Command (쓰기)**: 비즈니스 로직 중심, 트랜잭션 안전성
2. **Query (읽기)**: 성능 중심, 복잡한 조회 최적화
3. **단일 DB**: 현재는 하나의 DB를 사용하되, 향후 확장 가능한 구조

## 🏗️ 테이블 설계

### 1. 사용자 관리 (User Management)

#### users 테이블

```sql
CREATE TABLE lh_cs__users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    email VARCHAR(255) NOT NULL COMMENT '이메일',
    password_hash VARCHAR(255) NOT NULL COMMENT '비밀번호 해시 (KCMVP)',
    password_salt VARCHAR(128) NOT NULL COMMENT '비밀번호 salt',
    kdf_algorithm VARCHAR(50) NOT NULL DEFAULT 'pbkdf2-hmac-sha256',
    kdf_params JSON NOT NULL COMMENT 'KDF 파라미터',
    pepper_version INT NOT NULL DEFAULT 1,
    hash_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_image_url VARCHAR(500) COMMENT '프로필 이미지 URL',
    role VARCHAR(30) DEFAULT 'USER' COMMENT '사용자 역할: ADMIN, CONSULTANT, USER, VISITOR',
    status VARCHAR(30) DEFAULT 'ACTIVE' COMMENT '계정 상태: ACTIVE, INACTIVE, LOCKED',
    department VARCHAR(100) COMMENT '부서',
    last_login_at TIMESTAMP COMMENT '마지막 로그인 시간',
    login_attempt_count INT DEFAULT 0 COMMENT '로그인 시도 횟수',
    locked_until TIMESTAMP COMMENT '계정 잠금 해제 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP COMMENT '소프트 삭제',

    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_deleted_at (deleted_at),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_department (department)
) COMMENT '사용자 정보';
    profile_image_url VARCHAR(500) COMMENT '프로필 이미지 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT '소프트 삭제',
    INDEX idx_email (email),
    INDEX idx_login_type (login_type)
) COMMENT '사용자 정보';
```

### 2. 사용자 권한 테이블

```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL COMMENT '권한 명: ADMIN, MANAGER',
)
```

### 3. 할당된 사용자 권한 테이블

```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
)
```

### 4. 시설 관리 (Facility Management)

#### facilities 테이블

설비는 투어에서 이동 시키기 위한 용도로 사용된다.

```sql
CREATE TABLE facilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL COMMENT '시설명',
    description VARCHAR(255) COMMENT '시설 설명',
    scene_id BIGINT COMMENT '설비가 설치된 투어의 Scene ID',
    camera_pos_x FLOAT COMMENT '카메라 포지션 X',
    camera_pos_y FLOAT COMMENT '카메라 포지션 Y',
    camera_pos_z FLOAT COMMENT '카메라 포지션 Z',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facility_type (facility_type),
    INDEX idx_status (status)
) COMMENT '투어 시설 정보';
```

### 5. 투어 관리 (Tour Management)

평형정보를 포함하고있는 투어

#### tours 테이블

```sql
CREATE TABLE tours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tour_id VARCHAR(200) NOT NULL COMMENT '투어 접근 ID',
    square_meters INT NOT NULL COMMENT '평형 제곱미터',
    title VARCHAR(50) NOT NULL COMMENT '평형 정보 제목',
    description VARCHAR(255) COMMENT '투어 설명',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
) COMMENT '투어 정보';
```

### 6. 상담실 관리 (Consultation Room Management)

#### consultations 테이블

```sql
CREATE TABLE consultations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tour_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL COMMENT '상담원 id',
    visitor_id VARCHAR(36) COMMENT '방문자 uuid',
    start_facility_id VARCHAR(36) NOT NULL COMMENT '상담 시작시 시작 설비',
    consultation_code VARCHAR(30) NOT NULL COMMENT '상담원 입력 상담 코드',
    room_number VARCHAR(10) NOT NULL COMMENT '6자리 상담실 번호',
    room_name VARCHAR(100) COMMENT '상담실 이름',
    enter_code VARCHAR(4) COMMENT '상담실 입장코드 (Random)',
    capacity INT DEFAULT 2 COMMENT '수용 인원',
    status VARCHAR(30) COMMENT '상담실 상태: READY, CONSULTING, END',
    is_active TINYINT(1) NOT NULL COMMENT '활성화 상태: READY, CONSULTING 때는 true END가 되면 false로 변경',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES facilities(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
) COMMENT '상담실 정보';
```

### 7. 상담실 관리 히스토리(Consultation Room History)

```sql
CREATE TABLE consultation_histories(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consultation_id BIGINT NOT NULL,
    status VARCHAR(30) COMMENT '상담실 상태: READY, CONSULTING, END',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    INDEX idx_consultation_id (consultation_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '상담실 상태 변경 이력';
```

### 8. CQRS 이벤트 소싱 테이블 (선택사항)

#### event_store 테이블 (향후 확장용)

```sql
CREATE TABLE event_store (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(36) NOT NULL COMMENT '집합체 ID (상담실, 사용자 등)',
    aggregate_type VARCHAR(50) NOT NULL COMMENT '집합체 타입: CONSULTATION, USER, TOUR',
    event_type VARCHAR(100) NOT NULL COMMENT '이벤트 타입',
    event_data JSON NOT NULL COMMENT '이벤트 데이터',
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '이벤트 발생 시간',
    user_id BIGINT COMMENT '이벤트 발생시킨 사용자',

    INDEX idx_aggregate (aggregate_id, aggregate_type),
    INDEX idx_event_type (event_type),
    INDEX idx_occurred_at (occurred_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT 'CQRS 이벤트 저장소 (향후 확장용)';
```

### 9. 읽기 모델 최적화 테이블 (성능 필요시 선택사항)

#### read_consultations 테이블

> **💡 핵심 개념**: 쓰기 시점에 복잡한 JOIN을 미리 처리하고, 읽기 시점에는
> 간단하게 조회!

```sql
CREATE TABLE read_consultations (
    id BIGINT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    room_name VARCHAR(100),
    consultation_code VARCHAR(30) NOT NULL,
    enter_code VARCHAR(4),
    status VARCHAR(30),
    is_active TINYINT(1),

    -- 🔥 상담원 정보 (users 테이블에서 미리 가져와서 저장)
    consultant_id BIGINT NOT NULL,
    consultant_name VARCHAR(100) NOT NULL,
    consultant_email VARCHAR(255) NOT NULL,

    -- 🔥 투어 정보 (tours 테이블에서 미리 가져와서 저장)
    tour_id BIGINT NOT NULL,
    tour_title VARCHAR(50) NOT NULL,
    tour_square_meters INT NOT NULL,

    -- 🔥 시설 정보 (facilities 테이블에서 미리 가져와서 저장)
    facility_id BIGINT NOT NULL,
    facility_title VARCHAR(50) NOT NULL,
    facility_camera_pos_x FLOAT,
    facility_camera_pos_y FLOAT,
    facility_camera_pos_z FLOAT,

    -- 방문자 정보
    visitor_id VARCHAR(36),

    -- 시간 정보
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    -- 성능 최적화 인덱스
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_status_active (status, is_active),
    INDEX idx_room_number (room_number),
    INDEX idx_enter_code (enter_code)
) COMMENT '상담실 읽기 최적화 모델 - JOIN 없는 빠른 조회용';
```

### 10. 기타 읽기 모델 테이블 (확장시 참고)

#### read_statistics 테이블

```sql
CREATE TABLE read_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    consultant_id BIGINT NOT NULL,
    tour_id BIGINT,

    -- 통계 데이터 (미리 계산된 값들)
    total_consultations INT DEFAULT 0,
    completed_consultations INT DEFAULT 0,
    avg_duration_minutes DECIMAL(5,2) DEFAULT 0,
    visitor_join_rate DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_date_consultant_tour (date, consultant_id, tour_id),
    INDEX idx_consultant_date (consultant_id, date),
    FOREIGN KEY (consultant_id) REFERENCES users(id)
) COMMENT '상담 통계 읽기 모델';
```

#### read_dashboards 테이블

```sql
CREATE TABLE read_dashboards (
    consultant_id BIGINT PRIMARY KEY,

    -- 실시간 대시보드 데이터 (캐시용)
    total_active_rooms INT DEFAULT 0,
    waiting_rooms INT DEFAULT 0,
    consulting_rooms INT DEFAULT 0,
    rooms_with_visitors INT DEFAULT 0,
    avg_duration_today DECIMAL(5,2) DEFAULT 0,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (consultant_id) REFERENCES users(id)
) COMMENT '대시보드 읽기 모델 (실시간 캐시)';
```

### 11. 시스템 관리 테이블 (기본)

#### system_configurations 테이블

```sql
CREATE TABLE system_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '설정 키',
    config_value TEXT NOT NULL COMMENT '설정 값',
    config_type VARCHAR(20) DEFAULT 'STRING' COMMENT '값 타입: STRING, JSON, NUMBER, BOOLEAN',
    description VARCHAR(255) COMMENT '설정 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_config_key (config_key)
) COMMENT '시스템 설정';
```

## 🔗 관계 및 제약조건

### 주요 관계

1. **users** ← **consultations** (상담원)
2. **tours** ← **consultations** (투어별 상담실)
3. **facilities** ← **consultations** (시작 설비)
4. **consultations** ← **consultation_histories** (상담실별 상태 이력)
5. **users** ← **user_roles** ← **roles** (사용자 권한)
6. **read_consultations** ← **consultations** (읽기 모델 동기화)

### 데이터 무결성

- 외래키 제약조건으로 데이터 일관성 보장
- 소프트 삭제를 통한 데이터 보존
- 인덱스를 통한 조회 성능 최적화
- 읽기 모델을 통한 JOIN 연산 최소화

## 🏗️ CQRS Repository Layer 구조 (gs-mall-be 패턴)

### 기존 gs-mall-be 구조 유지

```
src/
├── application/           # Service Layer (비즈니스 로직)
│   ├── consultation.service.ts
│   ├── user.service.ts
│   └── dto/              # DTO 분리
├── infrastructure/       # 데이터 액세스 계층
│   ├── entity/          # TypeORM Entity
│   └── repository/      # Repository 분리 (CQRS 적용)
│       ├── command/     # 🔥 Command Repository (쓰기)
│       └── query/       # 🔥 Query Repository (읽기)
├── presentation/        # Controller Layer
└── module/             # NestJS Module
```

### Command Repository (쓰기 전용)

```typescript
// infrastructure/repository/command/consultation-command.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConsultationEntity } from '@/infrastructure/entity/consultation.entity';
import { CreateConsultationDto } from '@/application/dto/create-consultation.dto';

@Injectable()
export class ConsultationCommandRepository {
  constructor(
    @InjectRepository(ConsultationEntity)
    private readonly repo: Repository<ConsultationEntity>,
    private readonly dataSource: DataSource
  ) {}

  // 기본 CRUD (쓰기 작업)
  async create(createDto: CreateConsultationDto): Promise<ConsultationEntity> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 생성
      const consultation = manager.create(ConsultationEntity, createDto);
      const savedConsultation = await manager.save(consultation);

      // 2. 히스토리 생성
      await manager.save(ConsultationHistoryEntity, {
        consultationId: savedConsultation.id,
        status: 'READY',
      });

      // 3. 읽기 모델 동기화 (향후 추가)
      // await this.syncReadModel(savedConsultation.id, manager);

      return savedConsultation;
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 상태 업데이트
      await manager.update(ConsultationEntity, id, {
        status,
        updatedAt: new Date(),
      });

      // 2. 히스토리 추가
      await manager.save(ConsultationHistoryEntity, {
        consultationId: id,
        status,
      });
    });
  }

  async assignVisitor(id: string, visitorId: string): Promise<void> {
    await this.repo.update(id, {
      visitorId,
      updatedAt: new Date(),
    });
  }

  async endConsultation(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(ConsultationEntity, id, {
        status: 'END',
        isActive: false,
        updatedAt: new Date(),
      });

      await manager.save(ConsultationHistoryEntity, {
        consultationId: id,
        status: 'END',
      });
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.update(id, {
      deletedAt: new Date(),
    });
  }
}
```

### Query Repository (읽기 전용)

```typescript
// infrastructure/repository/query/consultation-query.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadConsultationEntity } from '@/infrastructure/entity/read-consultation.entity';

@Injectable()
export class ConsultationQueryRepository {
  constructor(
    @InjectRepository(ReadConsultationEntity)
    private readonly readModelRepo: Repository<ReadConsultationEntity>
  ) {}

  // 단순한 조회 메서드들
  async findById(id: string): Promise<ReadConsultationEntity | null> {
    return await this.readModelRepo.findOne({
      where: { id },
    });
  }

  async findActiveByUser(userId: string): Promise<ReadConsultationEntity[]> {
    return await this.readModelRepo.find({
      where: {
        consultantId: userId,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByRoomNumber(
    roomNumber: string
  ): Promise<ReadConsultationEntity | null> {
    return await this.readModelRepo.findOne({
      where: { roomNumber },
    });
  }

  async findByEnterCode(
    enterCode: string
  ): Promise<ReadConsultationEntity | null> {
    return await this.readModelRepo.findOne({
      where: {
        enterCode,
        status: ['READY', 'CONSULTING'],
        isActive: true,
      },
    });
  }

  // 검색 및 필터링
  async search(criteria: {
    consultantId: string;
    roomNumber?: string;
    status?: string;
    tourId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<ReadConsultationEntity[]> {
    const queryBuilder = this.readModelRepo.createQueryBuilder('crm');

    queryBuilder.where('crm.consultantId = :consultantId', {
      consultantId: criteria.consultantId,
    });

    if (criteria.roomNumber) {
      queryBuilder.andWhere('crm.roomNumber LIKE :roomNumber', {
        roomNumber: `%${criteria.roomNumber}%`,
      });
    }

    if (criteria.status) {
      queryBuilder.andWhere('crm.status = :status', {
        status: criteria.status,
      });
    }

    if (criteria.tourId) {
      queryBuilder.andWhere('crm.tourId = :tourId', {
        tourId: criteria.tourId,
      });
    }

    if (criteria.startDate && criteria.endDate) {
      queryBuilder.andWhere('crm.createdAt BETWEEN :startDate AND :endDate', {
        startDate: criteria.startDate,
        endDate: criteria.endDate,
      });
    }

    if (criteria.limit) {
      queryBuilder.limit(criteria.limit);
    }

    if (criteria.offset) {
      queryBuilder.offset(criteria.offset);
    }

    return await queryBuilder.orderBy('crm.createdAt', 'DESC').getMany();
  }

  // 통계 조회
  async getConsultationStats(userId: string): Promise<{
    totalActive: number;
    waitingRooms: number;
    consultingRooms: number;
    roomsWithVisitors: number;
  }> {
    const stats = await this.readModelRepo
      .createQueryBuilder('crm')
      .select('COUNT(*)', 'totalActive')
      .addSelect(
        `COUNT(CASE WHEN crm.status = 'READY' THEN 1 END)`,
        'waitingRooms'
      )
      .addSelect(
        `COUNT(CASE WHEN crm.status = 'CONSULTING' THEN 1 END)`,
        'consultingRooms'
      )
      .addSelect(
        `COUNT(CASE WHEN crm.visitorId IS NOT NULL THEN 1 END)`,
        'roomsWithVisitors'
      )
      .where('crm.consultantId = :userId', { userId })
      .andWhere('crm.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalActive: parseInt(stats.totalActive) || 0,
      waitingRooms: parseInt(stats.waitingRooms) || 0,
      consultingRooms: parseInt(stats.consultingRooms) || 0,
      roomsWithVisitors: parseInt(stats.roomsWithVisitors) || 0,
    };
  }
}
```

### Service Layer (gs-mall-be 패턴 유지)

```typescript
// application/consultation.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConsultationCommandRepository } from '@/infrastructure/repository/command/consultation-command.repository';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { CreateConsultationDto } from '@/application/dto/create-consultation.dto';
import { UpdateConsultationDto } from '@/application/dto/update-consultation.dto';
import { ConsultationResponseDto } from '@/application/dto/consultation-response.dto';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly logger: Logger,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly queryRepository: ConsultationQueryRepository
  ) {}

  // Command 작업 (쓰기)
  async createConsultation(
    createDto: CreateConsultationDto
  ): Promise<ConsultationResponseDto> {
    this.logger.log('createConsultation called with:', createDto);

    const consultation = await this.commandRepository.create(createDto);
    return this.mapToResponseDto(consultation);
  }

  async startConsultation(id: string, visitorId: string): Promise<void> {
    this.logger.log('startConsultation called', { id, visitorId });

    // 1. 상담실 존재 확인 (Query)
    const consultation = await this.queryRepository.findById(id);
    if (!consultation || consultation.status !== 'READY') {
      throw new NotFoundException(
        '상담실을 찾을 수 없거나 시작할 수 없는 상태입니다.'
      );
    }

    // 2. 방문자 할당 및 상태 변경 (Command)
    await this.commandRepository.assignVisitor(id, visitorId);
    await this.commandRepository.updateStatus(id, 'CONSULTING');
  }

  async endConsultation(id: string): Promise<void> {
    this.logger.log('endConsultation called with id:', id);

    const consultation = await this.queryRepository.findById(id);
    if (
      !consultation ||
      !['READY', 'CONSULTING'].includes(consultation.status)
    ) {
      throw new NotFoundException('종료할 수 있는 상담실이 아닙니다.');
    }

    await this.commandRepository.endConsultation(id);
  }

  // Query 작업 (읽기)
  async getAllActiveConsultations(
    userId: string
  ): Promise<ConsultationResponseDto[]> {
    this.logger.log('getAllActiveConsultations called for user:', userId);

    const consultations = await this.queryRepository.findActiveByUser(userId);
    return consultations.map((consultation) =>
      this.mapToResponseDto(consultation)
    );
  }

  async getConsultationById(id: string): Promise<ConsultationResponseDto> {
    this.logger.log('getConsultationById called with id:', id);

    const consultation = await this.queryRepository.findById(id);
    if (!consultation) {
      throw new NotFoundException(`상담실 ID ${id}를 찾을 수 없습니다.`);
    }

    return this.mapToResponseDto(consultation);
  }

  async findConsultationByEnterCode(
    enterCode: string
  ): Promise<ConsultationResponseDto> {
    this.logger.log('findConsultationByEnterCode called with code:', enterCode);

    const consultation = await this.queryRepository.findByEnterCode(enterCode);
    if (!consultation) {
      throw new NotFoundException('입장 코드가 유효하지 않습니다.');
    }

    return this.mapToResponseDto(consultation);
  }

  async searchConsultations(
    criteria: SearchConsultationCriteria
  ): Promise<ConsultationResponseDto[]> {
    const consultations = await this.queryRepository.search(criteria);
    return consultations.map((consultation) =>
      this.mapToResponseDto(consultation)
    );
  }

  async getDashboardStats(userId: string): Promise<ConsultationStatsDto> {
    return await this.queryRepository.getConsultationStats(userId);
  }

  // DTO 매핑 (gs-mall-be 패턴)
  private mapToResponseDto(entity: any): ConsultationResponseDto {
    return {
      id: entity.id,
      roomNumber: entity.roomNumber,
      roomName: entity.roomName,
      consultationCode: entity.consultationCode,
      enterCode: entity.enterCode,
      status: entity.status,
      consultantName: entity.consultantName,
      tourTitle: entity.tourTitle,
      facilityTitle: entity.facilityTitle,
      visitorId: entity.visitorId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

### Controller Layer (gs-mall-be 패턴 유지)

```typescript
// presentation/controller/consultation.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ConsultationService } from '@/application/consultation.service';
import { CreateConsultationDto } from '@/application/dto/create-consultation.dto';
import { ConsultationResponseDto } from '@/application/dto/consultation-response.dto';

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @ApiOperation({ summary: '상담실 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ConsultationResponseDto })
  async createConsultation(
    @Body() createDto: CreateConsultationDto
  ): Promise<ConsultationResponseDto> {
    return await this.consultationService.createConsultation(createDto);
  }

  @Get('active')
  @ApiOperation({ summary: '활성 상담실 목록 조회' })
  @ApiResponse({ status: HttpStatus.OK, type: [ConsultationResponseDto] })
  async getActiveConsultations(
    @Query('userId') userId: string
  ): Promise<ConsultationResponseDto[]> {
    return await this.consultationService.getAllActiveConsultations(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '상담실 상세 조회' })
  @ApiParam({ name: 'id', type: 'bigint' })
  @ApiResponse({ status: HttpStatus.OK, type: ConsultationResponseDto })
  async getConsultationById(
    @Param('id') id: string
  ): Promise<ConsultationResponseDto> {
    return await this.consultationService.getConsultationById(id);
  }

  @Put(':id/start')
  @ApiOperation({ summary: '상담 시작' })
  @ApiParam({ name: 'id', type: 'bigint' })
  async startConsultation(
    @Param('id') id: string,
    @Body() body: { visitorId: string }
  ): Promise<void> {
    await this.consultationService.startConsultation(id, body.visitorId);
  }

  @Put(':id/end')
  @ApiOperation({ summary: '상담 종료' })
  @ApiParam({ name: 'id', type: 'bigint' })
  async endConsultation(@Param('id') id: string): Promise<void> {
    await this.consultationService.endConsultation(id);
  }

  @Get('enter-code/:code')
  @ApiOperation({ summary: '입장 코드로 상담실 찾기' })
  @ApiParam({ name: 'code', type: 'string' })
  async findByEnterCode(
    @Param('code') enterCode: string
  ): Promise<ConsultationResponseDto> {
    return await this.consultationService.findConsultationByEnterCode(
      enterCode
    );
  }
}
```

### Module 구성 (gs-mall-be 패턴)

```typescript
// module/consultation.module.ts
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationEntity } from '@/infrastructure/entity/consultation.entity';
import { ReadConsultationEntity } from '@/infrastructure/entity/read-consultation.entity';
import { ConsultationHistoryEntity } from '@/infrastructure/entity/consultation-history.entity';
import { ConsultationCommandRepository } from '@/infrastructure/repository/command/consultation-command.repository';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationService } from '@/application/consultation.service';
import { ConsultationController } from '@/presentation/controller/consultation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConsultationEntity,
      ReadConsultationEntity,
      ConsultationHistoryEntity,
    ]),
  ],
  controllers: [ConsultationController],
  providers: [
    Logger,
    ConsultationService,
    ConsultationCommandRepository,
    ConsultationQueryRepository,
  ],
  exports: [
    ConsultationService,
    ConsultationCommandRepository,
    ConsultationQueryRepository,
  ],
})
export class ConsultationModule {}
```

#### 1. 상담실 생성 Command

```sql
-- 트랜잭션으로 묶인 상담실 생성
START TRANSACTION;

-- 1) 상담실 생성
INSERT INTO consultations (
    tour_id, user_id, start_facility_id, consultation_code,
    room_number, room_name, enter_code, status, is_active
) VALUES (?, ?, ?, ?, ?, ?, ?, 'READY', 1);

SET @consultation_id = LAST_INSERT_ID();

-- 2) 히스토리 생성
INSERT INTO consultation_histories (consultation_id, status)
VALUES (@consultation_id, 'READY');

-- 3) 이벤트 저장
INSERT INTO event_store (
    aggregate_id, aggregate_type, event_type, event_data, user_id
) VALUES (
    @consultation_id,
    'CONSULTATION',
    'ConsultationCreated',
    JSON_OBJECT(
        'consultationId', @consultation_id,
        'userId', ?,
        'tourId', ?,
        'roomNumber', ?,
        'status', 'READY'
    ),
    ?
);

-- 4) 읽기 모델 생성
INSERT INTO read_consultations (
    id, room_number, room_name, consultation_code, enter_code, status, is_active,
    consultant_id, consultant_name, consultant_email,
    tour_id, tour_title, tour_square_meters,
    facility_id, facility_title, facility_camera_pos_x, facility_camera_pos_y, facility_camera_pos_z,
    created_at, updated_at
) SELECT
    c.id, c.room_number, c.room_name, c.consultation_code, c.enter_code, c.status, c.is_active,
    u.id, u.name, u.email,
    t.id, t.title, t.square_meters,
    f.id, f.title, f.camera_pos_x, f.camera_pos_y, f.camera_pos_z,
    c.created_at, c.updated_at
FROM consultations c
JOIN users u ON c.user_id = u.id
JOIN tours t ON c.tour_id = t.id
JOIN facilities f ON c.start_facility_id = f.id
WHERE c.id = @consultation_id;

COMMIT;
```

#### 2. 상담 시작 Command

```sql
START TRANSACTION;

-- 1) 상담실 상태 업데이트
UPDATE consultations
SET visitor_id = ?, status = 'CONSULTING', updated_at = NOW()
WHERE id = ? AND status = 'READY';

-- 2) 히스토리 추가
INSERT INTO consultation_histories (consultation_id, status)
VALUES (?, 'CONSULTING');

-- 3) 이벤트 저장
INSERT INTO event_store (
    aggregate_id, aggregate_type, event_type, event_data, user_id
) VALUES (
    ?, 'CONSULTATION', 'ConsultationStarted',
    JSON_OBJECT('consultationId', ?, 'visitorId', ?, 'startedAt', NOW()),
    ?
);

-- 4) 읽기 모델 업데이트
UPDATE read_consultations
SET visitor_id = ?,
    status = 'CONSULTING',
    visitor_joined_at = NOW(),
    consultation_started_at = NOW(),
    updated_at = NOW()
WHERE id = ?;

COMMIT;
```

#### 3. 상담 종료 Command

```sql
START TRANSACTION;

-- 1) 상담실 종료
UPDATE consultations
SET status = 'END', is_active = 0, updated_at = NOW()
WHERE id = ?;

-- 2) 소요시간 계산 및 읽기 모델 업데이트
UPDATE read_consultations
SET status = 'END',
    is_active = 0,
    consultation_ended_at = NOW(),
    duration_minutes = TIMESTAMPDIFF(MINUTE, consultation_started_at, NOW()),
    updated_at = NOW()
WHERE id = ?;

-- 3) 히스토리 추가
INSERT INTO consultation_histories (consultation_id, status)
VALUES (?, 'END');

-- 4) 이벤트 저장
INSERT INTO event_store (
    aggregate_id, aggregate_type, event_type, event_data, user_id
) VALUES (
    ?, 'CONSULTATION', 'ConsultationEnded',
    JSON_OBJECT('consultationId', ?, 'endedAt', NOW()),
    ?
);

-- 5) 통계 업데이트 (배치로 처리하거나 비동기로)
INSERT INTO consultation_statistics (
    date, consultant_id, tour_id, completed_consultations, total_duration_minutes
) VALUES (
    CURDATE(), ?, ?, 1,
    (SELECT duration_minutes FROM read_consultations WHERE id = ?)
) ON DUPLICATE KEY UPDATE
    completed_consultations = completed_consultations + 1,
    total_duration_minutes = total_duration_minutes + VALUES(total_duration_minutes),
    avg_duration_minutes = total_duration_minutes / completed_consultations;

COMMIT;
```

### Query 패턴 (읽기 작업)

#### 1. 상담실 현황 조회 (읽기 모델 활용)

```sql
-- 비정규화된 읽기 모델로 빠른 조회
SELECT
    id, room_number, room_name, consultation_code, enter_code, status,
    consultant_name, tour_title, tour_square_meters, facility_title,
    visitor_id, created_at, updated_at,
    CASE
        WHEN visitor_id IS NOT NULL THEN 'VISITOR_JOINED'
        ELSE 'WAITING_VISITOR'
    END as visitor_status
FROM read_consultations
WHERE consultant_id = ?
  AND is_active = 1
ORDER BY created_at DESC;
```

#### 2. 대시보드 요약 조회

```sql
-- 실시간 대시보드 데이터
SELECT
    COUNT(*) as total_active_rooms,
    COUNT(CASE WHEN status = 'READY' THEN 1 END) as waiting_rooms,
    COUNT(CASE WHEN status = 'CONSULTING' THEN 1 END) as consulting_rooms,
    COUNT(CASE WHEN visitor_id IS NOT NULL THEN 1 END) as rooms_with_visitors,
    AVG(duration_minutes) as avg_duration_today
FROM read_consultations
WHERE consultant_id = ?
  AND is_active = 1
  AND DATE(created_at) = CURDATE();
```

#### 3. 상담 통계 조회

```sql
-- 기간별 상담 통계
SELECT
    date,
    total_consultations,
    completed_consultations,
    avg_duration_minutes,
    visitor_join_rate,
    (completed_consultations / total_consultations * 100) as completion_rate
FROM consultation_statistics
WHERE consultant_id = ?
  AND date BETWEEN ? AND ?
ORDER BY date DESC;
```

#### 4. 상담실 검색 (개선된 버전)

```sql
-- 🔥 개선된 간단한 검색 쿼리
SELECT
    id, room_number, room_name, consultation_code, status,
    consultant_name, tour_title, facility_title,
    visitor_id, created_at, duration_minutes
FROM read_consultations
WHERE consultant_id = :consultantId
  AND (:roomNumber = '' OR room_number LIKE :roomNumberPattern)
  AND (:status = '' OR status = :status)
  AND (:tourId = 0 OR tour_id = :tourId)
  AND created_at BETWEEN :startDate AND :endDate
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;

-- 📊 상태 히스토리가 필요한 경우 별도 쿼리로 분리
SELECT
    consultation_id,
    GROUP_CONCAT(status ORDER BY created_at SEPARATOR ' → ') as status_flow,
    COUNT(*) as status_changes
FROM consultation_histories
WHERE consultation_id IN (:consultationIds)
GROUP BY consultation_id;
```

#### 4-1. TypeScript Repository 구현 예시

```typescript
interface SearchConsultationParams {
  consultantId: string;
  roomNumber?: string;
  status?: string;
  tourId?: string;
  startDate: Date;
  endDate: Date;
  limit: number;
  offset: number;
}

class ConsultationQueryRepository {
  async searchConsultations(params: SearchConsultationParams) {
    // 🎯 동적 쿼리 빌더 (조건부 WHERE 절)
    let query = `
      SELECT * FROM read_consultations 
      WHERE consultant_id = ?
    `;

    const queryParams: any[] = [params.consultantId];

    // 조건이 있을 때만 WHERE 절 추가
    if (params.roomNumber) {
      query += ` AND room_number LIKE ?`;
      queryParams.push(`%${params.roomNumber}%`);
    }

    if (params.status) {
      query += ` AND status = ?`;
      queryParams.push(params.status);
    }

    if (params.tourId) {
      query += ` AND tour_id = ?`;
      queryParams.push(params.tourId);
    }

    query += ` 
      AND created_at BETWEEN ? AND ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    queryParams.push(
      params.startDate,
      params.endDate,
      params.limit,
      params.offset
    );

    return this.dataSource.query(query, queryParams);
  }
}
```

#### 4-2. 더욱 간단한 접근법 (추천)

```sql
-- 🚀 읽기 모델에 검색 최적화 컬럼 추가
ALTER TABLE read_consultations
ADD COLUMN search_text TEXT GENERATED ALWAYS AS (
  CONCAT_WS(' ', room_number, room_name, consultation_code, consultant_name, tour_title)
) STORED,
ADD FULLTEXT INDEX idx_search_text (search_text);

-- 🔍 풀텍스트 검색으로 간단하게
SELECT * FROM read_consultations
WHERE consultant_id = ?
  AND MATCH(search_text) AGAINST(? IN NATURAL LANGUAGE MODE)
  AND (:status = '' OR status = :status)
  AND created_at BETWEEN ? AND ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;
```

#### 5. 이벤트 히스토리 조회

```sql
-- 특정 상담실의 모든 이벤트 조회
SELECT
    event_type,
    event_data,
    occurred_at,
    user_id,
    correlation_id
FROM event_store
WHERE aggregate_id = ?
  AND aggregate_type = 'CONSULTATION'
ORDER BY occurred_at;
```

### 성능 최적화 쿼리

#### 1. 인덱스 활용 조회

```sql
-- 복합 인덱스를 활용한 빠른 조회
SELECT id, room_number, status
FROM consultation_read_models
WHERE status = 'CONSULTING'
  AND is_active = 1
  AND consultant_id = ?
ORDER BY created_at;

-- 인덱스: idx_status_active_consultant (status, is_active, consultant_id, created_at)
```

#### 2. 캐시 무효화 쿼리

```sql
-- 읽기 모델 동기화 확인
SELECT
    c.id,
    c.updated_at as source_updated,
    crm.updated_at as read_model_updated,
    CASE
        WHEN c.updated_at > crm.updated_at THEN 'STALE'
        ELSE 'FRESH'
    END as sync_status
FROM consultations c
LEFT JOIN consultation_read_models crm ON c.id = crm.id
WHERE c.updated_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

        ELSE 'WAITING_VISITOR'
    END as visitor_status

FROM consultations c INNER JOIN tours t ON c.tour_id = t.id INNER JOIN
facilities f ON c.start_facility_id = f.id INNER JOIN users u ON c.user_id =
u.id WHERE c.user_id = ? AND c.is_active = 1 ORDER BY c.created_at DESC;

````

### 2. 상담실 생성

```sql
-- 상담실 생성 트랜잭션
START TRANSACTION;

-- 1) 상담실 생성
INSERT INTO consultations (
    tour_id,
    user_id,
    visitor_id,
    start_facility_id,
    consultation_code,
    room_number,
    room_name,
    enter_code,
    capacity,
    status,
    is_active,
    created_at,
    updated_at
) VALUES (
    ?, -- tour_id
    ?, -- user_id (로그인된 사용자)
    NULL, -- visitor_id (초기에는 NULL)
    ?, -- start_facility_id
    ?, -- consultation_code
    ?, -- room_number (6자리)
    ?, -- room_name
    ?, -- enter_code (4자리 랜덤)
    2, -- capacity (기본값)
    'READY', -- status
    1, -- is_active
    NOW(),
    NOW()
);

-- 2) 상담실 히스토리 생성
INSERT INTO consultation_histories (
    consultation_id,
    status,
    created_at
) VALUES (
    LAST_INSERT_ID(), -- 방금 생성된 상담실 ID
    'READY',
    NOW()
);

COMMIT;

-- 생성된 상담실 정보 조회
SELECT
    c.*,
    t.title as tour_title,
    f.title as start_facility_title
FROM consultations c
INNER JOIN tours t ON c.tour_id = t.id
INNER JOIN facilities f ON c.start_facility_id = f.id
WHERE c.id = LAST_INSERT_ID();
````

## 🔧 CQRS 구현 가이드라인

### 1. Repository Layer 분리

```typescript
// Command Repository (쓰기 전용)
@Injectable()
export class ConsultationCommandRepository {
  constructor(@InjectDataSource('write') private writeDataSource: DataSource) {}

  async create(command: CreateConsultationCommand): Promise<void> {
    await this.writeDataSource.transaction(async (manager) => {
      // 1. 엔티티 저장
      // 2. 히스토리 저장
      // 3. 이벤트 저장
      // 4. 읽기 모델 동기화
    });
  }
}

// Query Repository (읽기 전용)
@Injectable()
export class ConsultationQueryRepository {
  constructor(@InjectDataSource('read') private readDataSource: DataSource) {}

  async findActiveByUser(userId: string): Promise<ConsultationReadModel[]> {
    // 읽기 최적화된 쿼리
    return this.readDataSource.query(
      `
      SELECT * FROM consultation_read_models 
      WHERE consultant_id = ? AND is_active = 1
    `,
      [userId]
    );
  }
}
```

### 2. 이벤트 기반 읽기 모델 동기화

```typescript
@EventsHandler(ConsultationCreatedEvent)
export class ConsultationReadModelHandler {
  async handle(event: ConsultationCreatedEvent) {
    // 읽기 모델 업데이트
    await this.syncReadModel(event.aggregateId);
  }
}
```

### 3. 데이터 일관성 보장 전략

- **즉시 일관성**: Command 트랜잭션 내에서 읽기 모델 동기화
- **최종 일관성**: 이벤트 기반 비동기 동기화
- **보상 트랜잭션**: 실패 시 롤백 메커니즘

## 🛡️ 보안 고려사항

### 1. 데이터 접근 보안

```sql
-- 1) 사용자별 데이터 격리
CREATE OR REPLACE VIEW user_consultations AS
SELECT c.* FROM consultations c
WHERE c.user_id = CURRENT_USER_ID();

-- 2) 행 레벨 보안 (MySQL 8.0+)
CREATE POLICY consultation_policy ON consultations
FOR ALL TO consultation_user
USING (user_id = CURRENT_USER_ID());
```

### 2. 감사 로그 자동화

```sql
-- 트리거를 통한 자동 감사 로그
DELIMITER $$
CREATE TRIGGER audit_consultation_changes
AFTER UPDATE ON consultations
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id,
        old_values, new_values, created_at
    ) VALUES (
        NEW.user_id, 'UPDATE', 'CONSULTATION', NEW.id,
        JSON_OBJECT('status', OLD.status, 'visitor_id', OLD.visitor_id),
        JSON_OBJECT('status', NEW.status, 'visitor_id', NEW.visitor_id),
        NOW()
    );
END$$
DELIMITER ;
```

### 3. 데이터 암호화

```sql
-- 민감한 데이터 암호화 저장
CREATE TABLE encrypted_user_data (
    user_id BIGINT PRIMARY KEY,
    encrypted_personal_info VARBINARY(1000) COMMENT 'AES 암호화된 개인정보',
    salt VARCHAR(32) COMMENT '암호화 솔트',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 📈 성능 최적화 전략

### 1. 읽기 모델 최적화

```sql
-- 자주 사용되는 쿼리 패턴에 맞춘 복합 인덱스
CREATE INDEX idx_consultation_dashboard
ON consultation_read_models (consultant_id, status, is_active, created_at);

-- 파티셔닝으로 대용량 데이터 처리
ALTER TABLE consultation_histories
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 2. 캐시 전략

```typescript
@Injectable()
export class ConsultationCacheService {
  async getActiveConsultations(
    userId: string
  ): Promise<ConsultationReadModel[]> {
    const cacheKey = `consultations:active:${userId}`;

    let data = await this.redis.get(cacheKey);
    if (!data) {
      data = await this.queryRepository.findActiveByUser(userId);
      await this.redis.setex(cacheKey, 300, JSON.stringify(data)); // 5분 캐시
    }

    return JSON.parse(data);
  }
}
```

### 3. 배치 처리

```sql
-- 통계 데이터 배치 업데이트
CREATE EVENT update_daily_statistics
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 01:00:00'
DO
BEGIN
    INSERT INTO consultation_statistics (
        date, consultant_id, tour_id,
        total_consultations, completed_consultations,
        total_duration_minutes, avg_duration_minutes
    )
    SELECT
        DATE(created_at) as date,
        consultant_id,
        tour_id,
        COUNT(*) as total_consultations,
        COUNT(CASE WHEN status = 'END' THEN 1 END) as completed_consultations,
        SUM(COALESCE(duration_minutes, 0)) as total_duration_minutes,
        AVG(COALESCE(duration_minutes, 0)) as avg_duration_minutes
    FROM consultation_read_models
    WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    GROUP BY DATE(created_at), consultant_id, tour_id
    ON DUPLICATE KEY UPDATE
        total_consultations = VALUES(total_consultations),
        completed_consultations = VALUES(completed_consultations),
        total_duration_minutes = VALUES(total_duration_minutes),
        avg_duration_minutes = VALUES(avg_duration_minutes);
END;
```

## 🔄 마이그레이션 전략

### 1. 기존 시스템에서 CQRS로 전환

```sql
-- 1단계: 읽기 모델 초기 데이터 마이그레이션
INSERT INTO consultation_read_models (
    id, room_number, room_name, consultation_code, enter_code, status, is_active,
    consultant_id, consultant_name, consultant_email,
    tour_id, tour_title, tour_square_meters,
    facility_id, facility_title, facility_camera_pos_x, facility_camera_pos_y, facility_camera_pos_z,
    visitor_id, created_at, updated_at
)
SELECT
    c.id, c.room_number, c.room_name, c.consultation_code, c.enter_code, c.status, c.is_active,
    u.id, u.name, u.email,
    t.id, t.title, t.square_meters,
    f.id, f.title, f.camera_pos_x, f.camera_pos_y, f.camera_pos_z,
    c.visitor_id, c.created_at, c.updated_at
FROM consultations c
JOIN users u ON c.user_id = u.id
JOIN tours t ON c.tour_id = t.id
JOIN facilities f ON c.start_facility_id = f.id;

-- 2단계: 이벤트 히스토리 재구성 (기존 데이터 기반)
INSERT INTO event_store (aggregate_id, aggregate_type, event_type, event_data, occurred_at)
SELECT
    consultation_id,
    'CONSULTATION',
    CONCAT('StatusChangedTo', status),
    JSON_OBJECT('status', status, 'consultationId', consultation_id),
    created_at
FROM consultation_histories
ORDER BY consultation_id, created_at;
```

### 2. 점진적 전환 전략

1. **Phase 1**: 기존 시스템과 CQRS 병행 운영
2. **Phase 2**: 읽기 쿼리를 CQRS로 점진적 이관
3. **Phase 3**: 쓰기 작업을 Command 패턴으로 전환
4. **Phase 4**: 기존 시스템 제거

이 설계는 CQRS와 Multi Datasource Repository Layer를 고려한 확장 가능한 구조로,
현재는 단일 DB를 사용하되 향후 읽기/쓰기 DB 분리가 용이하도록 설계되었습니다.

-- 1) 상담실 비활성화 및 상태 변경 UPDATE consultations SET status = 'END',
is_active = 0, updated_at = NOW() WHERE id = ? AND status IN ('READY',
'CONSULTING') AND is_active = 1;

-- 2) 종료 히스토리 생성 INSERT INTO consultation_histories ( consultation_id,
status, created_at ) VALUES ( ?, -- consultation_id 'END', NOW() );

COMMIT;

-- 종료 확인 조회 SELECT c.id, c.room_number, c.status, c.is_active,
c.updated_at, TIMESTAMPDIFF(MINUTE, c.created_at, c.updated_at) as
duration_minutes FROM consultations c WHERE c.id = ?;

````

### 5. 사용자별 상담 이력

```sql
-- 특정 사용자의 모든 상담 이력 조회
SELECT
    c.id,
    c.room_number,
    c.room_name,
    c.consultation_code,
    c.status,
    c.created_at,
    c.updated_at,
    t.title as tour_title,
    t.square_meters,
    f.title as start_facility_title,
    CASE
        WHEN c.visitor_id IS NOT NULL THEN 'VISITOR_JOINED'
        ELSE 'NO_VISITOR'
    END as visitor_status,
    TIMESTAMPDIFF(MINUTE, c.created_at, c.updated_at) as duration_minutes,
    -- 상담실 상태 변경 이력
    GROUP_CONCAT(
        CONCAT(ch.status, ':', DATE_FORMAT(ch.created_at, '%Y-%m-%d %H:%i:%s'))
        ORDER BY ch.created_at
        SEPARATOR ' | '
    ) as status_history
FROM consultations c
INNER JOIN tours t ON c.tour_id = t.id
INNER JOIN facilities f ON c.start_facility_id = f.id
LEFT JOIN consultation_histories ch ON c.id = ch.consultation_id
WHERE c.user_id = ?
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT ? OFFSET ?;

-- 상담 이력 통계
SELECT
    COUNT(*) as total_consultations,
    COUNT(CASE WHEN c.status = 'END' THEN 1 END) as completed_consultations,
    COUNT(CASE WHEN c.status = 'CONSULTING' THEN 1 END) as ongoing_consultations,
    COUNT(CASE WHEN c.status = 'READY' THEN 1 END) as waiting_consultations,
    COUNT(CASE WHEN c.visitor_id IS NOT NULL THEN 1 END) as visitor_joined_count,
    AVG(TIMESTAMPDIFF(MINUTE, c.created_at, c.updated_at)) as avg_duration_minutes
FROM consultations c
WHERE c.user_id = ?;
````

### 6. 추가 유용한 쿼리들

#### 6-1. 방문자 입장용 상담실 검증

```sql
-- 방문자가 입장 코드로 상담실 찾기
SELECT
    c.id,
    c.room_number,
    c.room_name,
    c.status,
    c.is_active,
    u.name as consultant_name,
    t.title as tour_title,
    f.title as start_facility_title,
    f.camera_pos_x,
    f.camera_pos_y,
    f.camera_pos_z
FROM consultations c
INNER JOIN users u ON c.user_id = u.id
INNER JOIN tours t ON c.tour_id = t.id
INNER JOIN facilities f ON c.start_facility_id = f.id
WHERE c.enter_code = ?
  AND c.status IN ('READY', 'CONSULTING')
  AND c.is_active = 1;
```

#### 6-2. 투어별 상담실 현황

```sql
-- 특정 투어의 모든 상담실 현황
SELECT
    t.title as tour_title,
    t.square_meters,
    COUNT(c.id) as total_rooms,
    COUNT(CASE WHEN c.status = 'READY' THEN 1 END) as ready_rooms,
    COUNT(CASE WHEN c.status = 'CONSULTING' THEN 1 END) as consulting_rooms,
    COUNT(CASE WHEN c.status = 'END' THEN 1 END) as ended_rooms
FROM tours t
LEFT JOIN consultations c ON t.id = c.tour_id AND c.is_active = 1
WHERE t.id = ?
GROUP BY t.id;
```

#### 6-3. 상담실 상세 정보 및 히스토리

```sql
-- 상담실 상세 정보와 전체 히스토리
SELECT
    c.*,
    u.name as consultant_name,
    u.email as consultant_email,
    t.title as tour_title,
    t.square_meters,
    t.description as tour_description,
    f.title as start_facility_title,
    f.description as facility_description,
    f.camera_pos_x,
    f.camera_pos_y,
    f.camera_pos_z
FROM consultations c
INNER JOIN users u ON c.user_id = u.id
INNER JOIN tours t ON c.tour_id = t.id
INNER JOIN facilities f ON c.start_facility_id = f.id
WHERE c.id = ?;

-- 해당 상담실의 상태 변경 히스토리
SELECT
    ch.status,
    ch.created_at,
    TIMESTAMPDIFF(MINUTE,
        LAG(ch.created_at) OVER (ORDER BY ch.created_at),
        ch.created_at
    ) as minutes_in_previous_status
FROM consultation_histories ch
WHERE ch.consultation_id = ?
ORDER BY ch.created_at;
```

## 🛡️ 보안 고려사항

### 1. 기본 보안 원칙

- **사용자별 데이터 격리**: Repository 레벨에서 user_id 기반 필터링
- **접근 코드 관리**: 상담실 입장 코드의 유효성 검증
- **세션 관리**: 적절한 만료 시간과 갱신 정책

### 2. 데이터 무결성

- **트랜잭션 처리**: 비즈니스 로직에서 일관성 보장
- **외래키 제약조건**: 데이터 참조 무결성 유지
- **소프트 삭제**: 데이터 복구 가능성 보장

## 📋 구현 체크리스트

### ✅ **1단계**: 기본 테이블 생성

- [ ] users, roles, user_roles
- [ ] facilities, tours
- [ ] consultations, consultation_histories

### ✅ **2단계**: Repository 패턴 구현

- [ ] Command Repository (쓰기)
- [ ] Query Repository (읽기)
- [ ] Service Layer (비즈니스 로직)

### ✅ **3단계**: 읽기 최적화

- [ ] consultation_read_models 테이블
- [ ] 데이터 동기화 로직
- [ ] 성능 인덱스 최적화

### 🔮 **향후 확장** (선택적)

- [ ] event_store (이벤트 소싱)
- [ ] 통계 및 분석 기능
- [ ] 읽기/쓰기 DB 분리

## 💡 gs-mall-be 기반 CQRS 구현 요약

### **핵심 개념**

1. **기존 구조 유지**: Service, Controller, Entity, Module 패턴
2. **Repository만 분리**: command/ 와 query/ 디렉토리로 구분
3. **읽기 모델 추가**: 성능 최적화를 위한 비정규화 테이블 (선택사항)
4. **점진적 도입**: 기존 코드를 단계별로 전환

### **장점**

- ✅ **기존 팀 친화적**: gs-mall-be 패턴 그대로 유지
- ✅ **점진적 전환**: 기존 시스템 영향 최소화
- ✅ **성능 향상**: 읽기 최적화를 통한 빠른 조회 (필요시)
- ✅ **확장성**: 향후 읽기/쓰기 DB 분리 용이

## 💡 consultation_read_models 사용 여부 결정

### **🤔 언제 사용하나?**

- **사용자가 많아져서** 상담실 목록 조회가 느려질 때
- **복잡한 검색 기능**이 필요할 때 (상담원명, 투어명으로 검색 등)
- **대시보드나 통계** 화면에서 빠른 응답이 필요할 때

### **⚡ 성능 차이 예시**

**Without 읽기 모델** (매번 3개 테이블 JOIN)

```sql
-- 😓 조회할 때마다 복잡한 JOIN 실행 (느림)
SELECT c.*, u.name, t.title, f.title
FROM consultations c
JOIN users u ON c.user_id = u.id
JOIN tours t ON c.tour_id = t.id
JOIN facilities f ON c.start_facility_id = f.id
WHERE c.user_id = ? AND c.is_active = 1;
```

**With 읽기 모델** (단순 SELECT)

```sql
-- 😍 단순 조회만! (빠름)
SELECT * FROM consultation_read_models
WHERE consultant_id = ? AND is_active = 1;
```

### **🔄 데이터 흐름**

```
📝 상담실 생성/수정 시점 (1번만)
┌─────────────────┐    복잡한 INSERT    ┌──────────────────────┐
│  consultations  │ ─────────────────→ │ consultation_read_   │
│  users         │                     │ models (JOIN 결과    │
│  tours         │                     │ 미리 저장)           │
│  facilities    │                     └──────────────────────┘
└─────────────────┘

📖 상담실 조회 시점 (N번)
┌──────────────────────┐    간단한 SELECT    ┌─────────────┐
│ consultation_read_   │ ──────────────────→ │ 화면에 표시 │
│ models              │                     └─────────────┘
└──────────────────────┘
```

### **🚀 간단한 시작: 읽기 모델 없이**

```typescript
// Query Repository에서 기존 테이블 그대로 사용
@Injectable()
export class ConsultationQueryRepository {
  async findActiveByUser(userId: string): Promise<ConsultationEntity[]> {
    return await this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.tour', 't')
      .leftJoinAndSelect('c.facility', 'f')
      .where('c.userId = :userId AND c.isActive = true', { userId })
      .getMany();
  }

  // 성능이 괜찮다면 이것만으로도 충분!
}
```

### **⚡ 성능이 필요할 때: 읽기 모델 추가**

```typescript
// 상담실 생성할 때 복잡한 JOIN으로 읽기 모델 생성
async create(createDto: CreateConsultationDto) {
  await this.dataSource.transaction(async (manager) => {
    // 1. 기본 테이블 저장
    const consultation = await manager.save(ConsultationEntity, createDto);

    // 2. 복잡한 JOIN으로 읽기 모델 생성 (한 번만!)
    await manager.query(`
      INSERT INTO consultation_read_models (
        id, room_number, consultant_name, tour_title, facility_title, ...
      )
      SELECT
        c.id, c.room_number, u.name, t.title, f.title, ...
      FROM consultations c
      JOIN users u ON c.user_id = u.id
      JOIN tours t ON c.tour_id = t.id
      JOIN facilities f ON c.start_facility_id = f.id
      WHERE c.id = ?
    `, [consultation.id]);
  });
}

// 조회할 때는 단순하게!
async findActiveByUser(userId: string) {
  return await this.readModelRepo.find({
    where: { consultantId: userId, isActive: true }
  });
}
```

### **📋 권장 구현 순서**

1. **1단계**: Repository만 Command/Query로 분리 (필수)
2. **2단계**: 성능 문제 발생시 읽기 모델 추가 (선택)
3. **3단계**: 필요에 따라 추가 최적화 (선택)

### **구현 우선순위**

1. **Repository 분리** → Command/Query 패턴 도입
2. **읽기 모델** → 성능 최적화
3. **데이터 동기화** → 일관성 보장
4. **모니터링** → 성능 및 에러 추적

이제 **gs-mall-be 구조를 유지하면서 CQRS의 장점**을 활용할 수 있는 설계가
완성되었습니다! 🚀
