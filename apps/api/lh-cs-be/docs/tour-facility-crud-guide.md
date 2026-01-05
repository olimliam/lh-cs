# 투어별 설비 CRUD API 가이드

## 개요

투어에 배치된 시설들을 관리하는 완전한 CRUD API입니다.

## API 엔드포인트

### 1. **CREATE** - 투어에 시설 추가

```http
POST /tours/{tourId}/facilities
```

- **기능**: 특정 투어에 시설을 추가하고 위치 정보를 설정
- **요청 본문**: 시설 ID, Scene ID, 시설 type, 카메라 위치, 기본 시작점 여부,
  표시 순서
- **응답**: 생성된 투어 시설 정보

### 2. **READ** - 조회 기능

#### 2.1 투어의 모든 시설 목록 조회

```http
GET /tours/{tourId}/facilities
```

- **기능**: 특정 투어에 배치된 모든 시설 목록 조회
- **정렬**: 표시 순서(display_order) 기준으로 정렬
- **응답**: 투어 시설 배열

#### 2.2 투어 시설 개별 상세 조회 ⭐️ **NEW**

```http
GET /tours/{tourId}/facilities/{facilityId}
```

- **기능**: 투어에 배치된 특정 시설의 상세 정보 조회
- **응답**: 투어 시설 상세 정보 (카메라 위치, 기본 시작점 여부 등)

### 3. **UPDATE** - 수정 기능

#### 3.1 투어 시설 정보 수정

```http
PUT /tours/{tourId}/facilities/{facilityId}
```

- **기능**: 투어에 배치된 시설의 위치나 설정 정보 수정
- **수정 가능**: Scene ID, 카메라 위치, 기본 시작점 여부, 표시 순서
- **응답**: 수정된 투어 시설 정보

#### 3.2 시설 순서 재배치 (부분 업데이트)

```http
PATCH /tours/{tourId}/facilities/reorder
```

- **기능**: 투어에 배치된 시설들의 표시 순서 일괄 변경
- **요청 본문**: 시설 ID와 새로운 순서 배열
- **응답**: 204 No Content

#### 3.3 기본 시작 위치 설정 (부분 업데이트)

```http
PATCH /tours/{tourId}/facilities/{facilityId}/default
```

- **기능**: 특정 시설을 투어의 기본 시작 위치로 설정
- **비즈니스 로직**: 기존 기본 시작점은 자동으로 해제
- **응답**: 204 No Content

### 4. **DELETE** - 삭제

```http
DELETE /tours/{tourId}/facilities/{facilityId}
```

- **기능**: 투어에서 특정 시설 제거 (소프트 삭제)
- **비즈니스 로직**: 기본 시작점이었다면 다른 시설을 기본 시작점으로 자동 설정
- **응답**: 204 No Content

---

## 요청/응답 예시

### 1. 투어에 시설 추가 (CREATE)

```bash
POST /tours/123/facilities
Content-Type: application/json

{
  "facilityId": "456",
  "sceneId": "789",
  "cameraPosX": 10.5,
  "cameraPosY": 20.3,
  "cameraPosZ": 15.8,
  "isDefaultStart": false,
  "displayOrder": 1,
  "type": "construction"
}
```

**응답:**

```json
{
  "id": "999",
  "tourId": "123",
  "facilityId": "456",
  "facilityTitle": "거실 조명",
  "facilityDescription": "메인 거실 LED 조명",
  "sceneId": "789",
  "cameraPosX": 10.5,
  "cameraPosY": 20.3,
  "cameraPosZ": 15.8,
  "isDefaultStart": false,
  "displayOrder": 1,
  "isActive": true,
  "type": "construction",
  "createdAt": "2024-01-15T09:30:00.000Z",
  "updatedAt": "2024-01-15T09:30:00.000Z"
}
```

### 2. 투어 시설 목록 조회 (READ)

```bash
GET /tours/123/facilities
```

**응답:**

```json
[
  {
    "id": "999",
    "tourId": "123",
    "facilityId": "456",
    "facilityTitle": "거실 조명",
    "sceneId": "789",
    "cameraPosX": 10.5,
    "cameraPosY": 20.3,
    "cameraPosZ": 15.8,
    "isDefaultStart": true,
    "displayOrder": 1,
    "isActive": true,
    "type": "construction",
    "createdAt": "2024-01-15T09:30:00.000Z",
    "updatedAt": "2024-01-15T09:30:00.000Z"
  },
  {
    "id": "1000",
    "tourId": "123",
    "facilityId": "457",
    "facilityTitle": "시스템 키친",
    "sceneId": "790",
    "cameraPosX": -2.0,
    "cameraPosY": 18.5,
    "cameraPosZ": 12.0,
    "isDefaultStart": false,
    "displayOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-15T09:45:00.000Z",
    "updatedAt": "2024-01-15T09:45:00.000Z"
  }
]
```

### 3. 투어 시설 개별 조회 (READ - 상세)

```bash
GET /tours/123/facilities/999
```

**응답:**

```json
{
  "id": "999",
  "tourId": "123",
  "facilityId": "456",
  "facilityTitle": "거실 조명",
  "facilityDescription": "메인 거실 LED 조명 시스템",
  "sceneId": "789",
  "cameraPosX": 10.5,
  "cameraPosY": 20.3,
  "cameraPosZ": 15.8,
  "isDefaultStart": true,
  "displayOrder": 1,
  "isActive": true,
  "type": "construction",
  "createdAt": "2024-01-15T09:30:00.000Z",
  "updatedAt": "2024-01-15T10:15:00.000Z"
}
```

### 4. 투어 시설 정보 수정 (UPDATE)

```bash
PUT /tours/123/facilities/999
Content-Type: application/json

{
  "cameraPosX": 12.0,
  "cameraPosY": 22.0,
  "cameraPosZ": 16.0,
  "displayOrder": 2,
  "type": "electrical",
}
```

### 5. 시설 순서 재배치 (UPDATE - 부분)

```bash
PATCH /tours/123/facilities/reorder
Content-Type: application/json

{
  "facilities": [
    {"id": "1000", "displayOrder": 1},
    {"id": "999", "displayOrder": 2}
  ]
}
```

### 6. 기본 시작 위치 설정 (UPDATE - 부분)

```bash
PATCH /tours/123/facilities/999/default
```

### 7. 투어에서 시설 제거 (DELETE)

```bash
DELETE /tours/123/facilities/999
```

---

## 비즈니스 규칙

### 1. 데이터 무결성

- 동일한 투어에서 같은 시설-씬 조합은 유일해야 함
- 투어당 최대 하나의 기본 시작점만 허용

### 2. 자동 처리 로직

- 기본 시작점 설정 시 기존 기본 시작점은 자동 해제
- 기본 시작점 시설 삭제 시 다른 시설을 자동으로 기본 시작점으로 설정

### 3. 정렬 및 표시

- 시설 목록은 표시 순서(display_order) 기준으로 자동 정렬
- 비활성 시설은 조회에서 자동 제외

---

## 에러 처리

### 주요 에러 코드

- **400 Bad Request**: 잘못된 요청 파라미터
- **404 Not Found**: 투어 또는 시설을 찾을 수 없음
- **409 Conflict**: 비즈니스 규칙 위반 (중복 배치 등)

### 에러 응답 예시

```json
{
  "statusCode": 409,
  "message": "이미 해당 위치에 시설이 배치되어 있습니다.",
  "error": "Conflict"
}
```

---

## 성능 최적화

### 1. 인덱스 활용

- 투어별 조회: `(tour_id, display_order)` 인덱스
- 기본 시작점 조회: `(tour_id, is_default_start)` 인덱스
- 유니크 제약: `(tour_id, facility_id, scene_id)` 인덱스

### 2. 관계 로딩

- 시설 정보는 JOIN으로 한 번에 로드
- N+1 쿼리 문제 방지

### 3. 정렬 최적화

- 데이터베이스 레벨에서 정렬 처리
- 애플리케이션 정렬 오버헤드 최소화

이제 투어별 설비에 대한 완전한 CRUD 기능이 구현되었습니다!
