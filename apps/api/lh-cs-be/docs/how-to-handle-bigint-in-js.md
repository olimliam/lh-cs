# JS/TS에서 DB BIGINT 다루기 가이드

## 1. 문제 배경

- **JavaScript/TypeScript의 Number 타입**

  - IEEE-754 64비트 부동소수점 사용
  - 안전하게 표현 가능한 정수 범위: `-(2^53 - 1)` ~ `2^53 - 1` (약 ±9 \* 10^15)
  - 이 범위를 초과하면 정밀도 손실 발생  
    예: `9007199254740993` → JS에서 `9007199254740992`로 변환됨

- **DB의 BIGINT 타입**
  - MySQL/MariaDB/Postgres의 BIGINT: 64비트 정수
  - 범위: `-(2^63)` ~ `(2^63 - 1)` (약 ±9 \* 10^18)
  - JS Number로 안전하게 표현할 수 없는 값이 존재

> DB에서는 정상 저장되지만, JS/TS에서는 값이 잘못 표현될 수 있다.

---

## 2. 해결책

### 2.1 문자열(string)로 관리

- DB에서 조회된 BIGINT를 string으로 매핑
- 데이터 자체가 깨질 일 없음
- 연산(+, -, 비교 등)을 하려면 변환 필요
- 보통 id, userId, orderId 같은 식별자 컬럼은 문자열로 두는 게 가장 안전

```typescript
@Column({ type: 'bigint' }) userId: string; // TypeORM에서 BIGINT → string 자동 매핑
```

### 2.2 JS의 BigInt 타입 사용

- ES2020부터 추가된 BigInt 타입 (`1n`, `BigInt(123)`)
- 안전하게 64비트 정수 처리 가능
- 단점:
  - `JSON.stringify(BigInt(1))` → TypeError 발생 (직렬화 불편)
  - REST API/JSON 통신 시 변환 로직 필요
  - 대규모 프로젝트에서는 API 응답에 불리해 잘 사용하지 않음

---

## 3. TypeORM에서의 처리

- TypeORM은 bigint 컬럼을 기본적으로 string으로 반환
- Entity에 string으로 타입을 선언하는 것이 권장됨

```typescript
@Entity('consultations')
export class ConsultationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'user_id', type: 'bigint', comment: '상담원 ID' })
  userId: string;
}
```

---

## 4. 권장 전략

- **식별자(ID 계열):** string으로 관리 (연산 불필요, 안전성 확보)
- **누적 수치 / 카운트 / 합산 값:**
  - 범위가 `2^53 - 1` 이하라면 number 사용
  - 초과 가능성이 있으면 BigInt 타입 사용 + API 변환 로직 추가

---

## 5. 요약

- JS Number는 정밀도 한계 때문에 DB BIGINT를 안전하게 담지 못할 수 있음
- TypeORM은 자동으로 string으로 반환하므로, Entity에 string으로 선언하는 것이
  안전
- 연산이 필요한 경우에 한해 BigInt 변환을 고려

> **결론:**  
> 식별자는 string으로, 수학적 연산이 필요한 값은 number/BigInt로 상황에 맞게
> 관리한다.
