# 공지/Q&A 첨부 파일명 보존 설계(다중 첨부)

## 1. 배경 및 목표
- 현재 `createQuestionAnswer`, `createNotification`는 S3에 첨부파일을 업로드하면서 DB에는 `file_url`만 보관하고 있어, 원본 파일명/파일 수를 조회 응답에 반영할 수 없습니다.
- 신규 UX 요구: (1) 게시물당 여러 개 첨부파일을 허용하고, (2) 각 파일의 원본명을 포함한 메타데이터를 유지하여 다운로드 시 사용자에게 익숙한 이름과 순서를 제공하며, (3) 프런트가 배열 형태로 전달한 파일들을 그대로 저장·조회할 수 있어야 합니다.

## 2. 요구사항 요약
- Request DTO: 프론트가 여러 개의 파일을 `FormData` `attachments[]`로 전송할 수 있도록 하고, 각 파일마다 `attachmentName`을 지정할 수 있게 합니다.
- 데이터 모델: `content_attachments`를 1:N 구조로 바꾸고 `owner_type`, `owner_id` 조합을 통해 게시물과 첨부를 매핑합니다. `attachment_index`(순서, nullable) 등으로 입력 순서를 유지합니다.
- Response DTO: `attachments` 배열을 반환하며 각 원소에 `{ fileName, fileUrl, fileKey, mimeType, fileSize }`를 담습니다. 첨부가 없으면 빈 배열 또는 `null`.
- S3 처리: 각 업로드에 대해 sanitize된 파일명을 기반으로 key 생성하며, 기존 객체 삭제/교체 방식도 배열 단위로 확장합니다.
- 삭제/교체 정합성: 지정된 파일만 삭제하거나 전체 교체할 수 있도록 `attachmentIdsToRemove`, `removeExistingFiles` 플래그를 DTO에 포함합니다.

## 3. 데이터 모델 설계
### 3.1 `lh_cs__content_attachments` 테이블 확장
| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `content_attachment_id` | BIGINT PK AUTO_INCREMENT | 첨부 식별자 |
| `owner_type` | VARCHAR(16) (`NOTIFICATION`/`QUESTION_ANSWER`) | 소유 도메인 |
| `owner_id` | BIGINT | 소유 행 ID |
| `attachment_index` | INT UNSIGNED NULL | 업로드 순서 또는 프론트 전달 순서 |
| `file_name` | VARCHAR(255) | 클라이언트가 전달한(또는 fallback) 파일명 |
| `file_url` | VARCHAR(500) | CDN/S3 접근 URL |
| `file_key` | VARCHAR(500) | S3 키(폴더/파일명 포함), 유니크 |
| `mime_type` | VARCHAR(100) NULL | MIME 정보(선택) |
| `file_size` | BIGINT NULL | 바이트 단위 크기(선택) |
| `created_by` | BIGINT | 업로더 ID |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

- 인덱스: 기존 `ux_content_attachments_owner(owner_type, owner_id)` 유니크 키를 삭제하고, 조회용 `idx_content_attachments_owner (owner_type, owner_id)`와 순서 보존용 `ux_content_attachments_owner_index (owner_type, owner_id, attachment_index)`를 새로 추가합니다. `ux_content_attachments_key (file_key)`는 그대로 유지합니다.
- 과거 계획상 존재하던 `content_attachment_id` FK 컬럼은 실제 배포되지 않았으므로 추가적인 DROP 처리는 필요 없습니다. 애플리케이션 단에서는 `ContentAttachmentOwnerType`(enum)으로 문자열 값을 제한하고 JOIN으로 첨부를 조회합니다.

### 3.2 엔티티 매핑
- `ContentAttachmentEntity`는 기존과 유사하나 다중 관계를 고려해 `ownerType`, `ownerId`에 대해 단반향 매핑만 유지합니다.
- `NotificationEntity`, `QuestionAnswerEntity`에서는 `contentAttachmentId` 컬럼을 삭제하고, `contentAttachments?: ContentAttachmentEntity[]` 형태로 `OneToMany` 관계를 정의하여 `ownerType`/`ownerId` 를 기준으로 로드합니다.

## 4. API 변경 설계
### 4.1 Request DTO
- `attachments?: AttachmentUploadCommand[]` 형태로 확장 (`CreateQuestionAnswerCommand`, `CreateNotificationCommand`, `Update*Command` 모두 적용).
  - `AttachmentUploadCommand`: `{ file: Express.Multer.File; attachmentName?: string }` (프런트가 `attachments` 배열로 넘긴 각 파일/이름).
  - 각 DTO에 `attachmentIdsToRemove?: number[]`, `removeExistingFiles?: boolean` (전체 삭제/지정 삭제 지원).
- 검증: 최대 첨부 개수(예: 5개), 각 파일 사이즈 제한, 요청 파일명(`attachmentName`)은 255자 이하, 경로 문자는 서비스에서 sanitize하여 저장.

### 4.2 Response DTO
- `QuestionAnswerResponse`, `NotificationResponse`에 `attachments?: ContentAttachmentResponse[]`.
  - `ContentAttachmentResponse`는 `{ attachmentId: number; fileName: string; fileUrl: string; fileKey: string; mimeType?: string; fileSize?: number; order?: number }`.
  - 첨부가 없으면 빈 배열 또는 `null`.
- `fileUrl`은 기존처럼 유지하되 여러 응답 객체에서 반복되므로 프론트에서 `attachments[0]?.fileUrl`, `attachments.map` 방식으로 소비하도록 문서화.

### 4.3 Validation/에러
- `attachments`가 존재할 때 `attachmentName`이 없으면 `file.originalname`을 fallback 저장.
- `attachmentName` 또는 `file.originalname`에서 경로 문자/상대 경로(`..`, `/`) 제거 후 sanitize.
- 개별 파일 업로드 실패 시 전체 트랜잭션을 롤백하고 `attachments` 폼을 재전송할 수 있도록 표준 에러 메시지(`Failed to upload attachment`)를 노출.

## 5. 서비스/도메인 로직 흐름
1) **업로드 키 생성**: `AttachmentUploadCommand`의 `attachmentName`을 `sanitizeFilename` → `key = {prefix}/{folder}/{uuid}-{sanitizedName}` (예: `notices/12345/uuid-원본명`).
2) **S3 업로드 반복**: `attachments` 배열을 순회하면서 `S3ClientService.uploadFile` 호출, `Content-Disposition`은 sanitize된 파일명.
3) **메타데이터 저장**: 동시성 대비 `owner_type`, `owner_id`, `attachment_index`, `file_name`, `file_url`, `file_key`, `mime_type`, `file_size`, `created_by`를 `content_attachments`에 삽입.
4) **기존 첨부 삭제**:
   - `removeExistingFiles=true`인 경우: 소유자의 기존 `content_attachments`를 모두 조회 → S3 삭제 → DB 삭제.
   - `attachmentIdsToRemove`가 제공되면 지정된 attachment만 삭제.
5) **조회/응답**: 소유자 기준으로 `content_attachments`를 `attachment_index` 순서로 정렬하여 DTO의 `attachments` 배열에 매핑.

## 6. 마이그레이션 및 배포 단계
1) `database/migrations/2025xxxx_add_content_attachments.sql` 업데이트:
   - 기존 `ux_content_attachments_owner(owner_type, owner_id)` 유니크 인덱스를 삭제하고 조회용 인덱스(`idx_content_attachments_owner`) + 순서 보존 유니크 키(`ux_content_attachments_owner_index`)를 추가합니다.
2) 백필 스크립트: 기존 `file_url` 컬럼이 있는 행을 순회하여 각 게시물의 첫 첨부로 `content_attachments` 행 생성(`attachment_index=1`), 이후 `file_url` 컬럼은 deprecated 처리.
3) 코드 배포:
   - DTO/명령어/서비스/레포지토리 변경 적용 및 Swagger 반영.
   - 프론트 FormData를 `attachments` 배열로 전송하도록 수정.
4) 검증: 생성→조회→수정→삭제 흐름에서 N개의 첨부(예: 0~3개)를 테스트, 응답 `attachments`를 통해 `fileName`/`fileUrl`/`order` 확인.
5) 최종: `file_url` 컬럼 제거 여부는 추후 마이그레이션으로 별도 처리.

## 7. 테스트 케이스(요약)
- 생성
  - 파일 3개 + `attachmentName` 각각 전달 → 응답 `attachments`에 `fileName`, `fileUrl`, `order` 순서대로 존재.
  - `attachmentName` 누락 → `file.originalname`이 DB/응답 이름으로 저장.
- 조회
  - 첨부 없으면 `attachments` 빈 배열.
  - 다중 첨부 → `attachment_index` 기준 정렬되어 반환.
- 수정
  - `attachmentIdsToRemove`로 지정된 ID만 삭제 → S3 객체와 DB 정리 확인.
  - `removeExistingFiles=true` 후 새 첨부 업로드 → 이전 객체 전체 삭제.
- 목록
  - 다중 게시물에서 `attachments` 조인시 N+1 없이 `IN` 기반 조회, Swagger 모델 문서화.

## 8. 호환성 및 주의사항
- **프런트엔드**: `apps/web/lh-cs-fe`에서 `FormData`에 `attachments[]` 여러 파일을 담고, 각 파일마다 `attachmentNames[]`를 순서대로 보내도록 수정. 업로드 UI는 `input type="file" multiple`과 명시적 `name` 입력 또는 자동 `originalname` fallback 제공.
- **백엔드**: 응답 `attachments` 배열 구조가 변경되어 Swagger, DTO, `@nestjs/swagger` 데코레이터를 업데이트하고, `apps/api/es-ws-be` 등 다른 서비스와의 호환성 체크리스트 작성.
- **보안**: S3 키는 sanitize된 이름+UUID로 생성하며, `attachmentName`이 인젝션될 수 있는 경로는 차단. 업로드 개수 제한(예: 5개), 사이즈 제한 및 MIME 검증을 재확인.

## 9. TODO (이행 계획)
- [ ] **DB 마이그레이션 작성 및 적용**: 다중 첨부 지원을 위해 스키마를 변경합니다.
  - [ ] `lh_cs__content_attachments`에 `owner_type`, `owner_id`, `attachment_index`, `file_key`, `mime_type`, `file_size`를 추가하고 인덱스를 구성합니다.
  - [ ] 적용 SQL 초안:
    ```sql
    ALTER TABLE `lh_cs__content_attachments`
      ADD COLUMN `owner_type` VARCHAR(16) NOT NULL AFTER `content_attachment_id`,
      ADD COLUMN `owner_id` BIGINT NOT NULL AFTER `owner_type`,
      ADD COLUMN `attachment_index` INT UNSIGNED NULL AFTER `owner_id`,
      ADD COLUMN `file_key` VARCHAR(500) NOT NULL AFTER `file_url`,
      ADD COLUMN `mime_type` VARCHAR(100) NULL AFTER `file_key`,
      ADD COLUMN `file_size` BIGINT NULL AFTER `mime_type`,
      DROP INDEX `ux_content_attachments_owner`,
      ADD KEY `idx_content_attachments_owner` (`owner_type`, `owner_id`),
      ADD UNIQUE KEY `ux_content_attachments_owner_index` (`owner_type`, `owner_id`, `attachment_index`),
      ADD UNIQUE KEY `ux_content_attachments_key` (`file_key`);

    ```
- [ ] **데이터 백필 스크립트 작성**: 기존 `notifications.file_url`, `question_answers.file_url` 데이터를 `lh_cs__content_attachments`로 이전하고 순서를 1로 저장한 뒤 원본 컬럼은 NULL 처리합니다.
- [ ] **엔티티/ORM 리팩터링**: `ContentAttachmentEntity`를 `ownerType`, `ownerId`, `attachmentIndex` 기반으로 매핑하고, `NotificationEntity`, `QuestionAnswerEntity`에는 `OneToMany contentAttachments` 필드를 추가합니다.
- [ ] **DTO·Command·밸리데이션 확장**: `Create/UpdateQuestionAnswerCommand`, `Create/UpdateNotificationCommand`에 `attachments`, `attachmentIdsToRemove`, `removeExistingFiles`를 반영하고 파일명/개수/사이즈 제한 검증을 추가합니다.
- [ ] **서비스/도메인 로직 구현**: 업로드/삭제/치환 로직을 배열 단위로 리팩터링하고, `sanitizeFilename`, `S3ClientService`를 재사용하여 `attachment_index` 순서를 보존합니다.
- [ ] **Response DTO 및 Swagger 문서화**: `QuestionAnswerResponse`, `NotificationResponse`에 `attachments: ContentAttachmentResponse[]`를 추가하고 Swagger 스키마/예시를 갱신합니다.
- [ ] **테스트 보강**: 단위·통합 테스트에서 첨부 0/1/N 케이스, 삭제/교체, 순서가 유지되는지 검증하고 `pnpm --filter lh-cs-be test`, `test:e2e`를 실행합니다.
- [ ] **프런트엔드 업데이트**: `apps/web/lh-cs-fe` 업로드 폼을 `attachments[]`/`attachmentNames[]` 배열 전송 방식으로 전환하고, 최신 응답 스키마에 맞춰 다운로드 UI를 수정 및 테스트합니다.
