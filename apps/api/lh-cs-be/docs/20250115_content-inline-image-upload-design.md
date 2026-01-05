# 게시글 인라인 이미지 업로드 설계

## 1. 배경 및 필요성
- 현재 공지/질문 게시글의 본문 이미지는 프론트에서 base64로 변환하여 문자열 형태로 저장하고 있어 저장 공간 비효율, 트래픽 증가, 디코딩 비용 및 편집 시 원본 URL 추적이 어렵습니다.
- 사용자 경험을 위해 에디터에서 삽입하는 `<img>` 태그는 외부 URL을 참조해야 하며, 서버에서 이미지를 별도 저장·관리하여 CDN/S3를 통한 안정적인 전달이 필요합니다.
- 따라서 프론트가 이미지 업로드 시 `base64`가 아닌 `S3 URL`을 받아 `<img src="...">`에 넣을 수 있도록 전용 업로드 API와 DB 테이블을 도입할 예정입니다.

## 2. 요구사항 요약
- 프론트는 `<input type="file" accept="image/*">` 또는 드래그로 선택한 이미지를 `POST /api/v1/contents/images` 같은 전용 엔드포인트로 업로드합니다.
- 백엔드는 이미지를 S3에 업로드하고 `content_images` 테이블에 메타데이터(S3 URL, 키, MIME, 크기, owner 정보 등)를 저장합니다.
- 응답으로는 `{ imageUrl, imageKey, imageId }`를 반환하여 프론트에서 `img`에 URL을 삽입합니다.
- 게시글 저장 시에는 최초 content 내에 존재하는 `img` URL을 `content_images`에 연결하여 누락 여부를 검증하거나 정리할 수 있어야 합니다.
- 향후 이미지 삭제/교체 요청에 사용할 수 있도록 `imageId` 또는 `imageKey`를 기반으로 S3와 DB를 정리할 수 있어야 합니다.

## 3. 데이터 모델 설계
| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `content_image_id` | BIGINT PK AUTO_INCREMENT | 인라인 이미지 식별자 |
| `owner_type` | VARCHAR(16) NOT NULL | 소유 도메인(기존 테이블과 동일한 문자열 방식) |
| `owner_id` | BIGINT NULL | 게시물 ID (삭제/정리 시 참고) |
| `image_key` | VARCHAR(500) NOT NULL UNIQUE | S3 저장 키 |
| `image_url` | VARCHAR(500) NOT NULL | CDN/S3 접근 URL |
| `file_name` | VARCHAR(255) NOT NULL | 업로드 원본 파일명 |
| `mime_type` | VARCHAR(100) | MIME 종류 |
| `file_size` | BIGINT | 파일 크기 |
| `created_by` | BIGINT NOT NULL | 업로더 ID |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 생성 시점 |
| `deleted_at` | TIMESTAMP NULL | 삭제 시점 (soft delete) |

- `owner_type`/`owner_id` 조합에 인덱스(`idx_content_images_owner`)를 두어 게시글 조회 시 연관된 이미지를 빠르게 잡아냅니다.
- `image_key`는 유니크로 S3 삭제 시 식별이 쉽도록 합니다.
- 같은 이미지를 여러 게시글에서 재사용할 수 없으며, 필요 시 별도 명시적 복제를 통해 새로운 행을 생성합니다.

## 4. API 설계
### 4.1 업로드 엔드포인트
- `POST /api/v1/content-images`
- 요청: `multipart/form-data`로 `file: image` 필드
- 응답: `200 OK` `{ imageId, imageUrl, imageKey, fileName, mimeType, fileSize }`
- 처리
  1. 파일명을 `sanitizeFilename`(경로 문자를 제거)하고 UUID 토큰과 결합하여 `key = contents/{ownerType ?? "unknown"}/{uuid}-{sanitizedName}` 형태 생성.
  2. `S3ClientService.uploadFile`을 호출하여 업로드, `Content-Disposition`에 원본명을 넣음.
  3. `content_images`에 메타 정보 삽입. `owner_id`는 업로드 시점에는 `null`로 두고, 게시글 저장/수정 흐름에서 나중에 채웁니다.
  4. 응답에 URL/ID/크기 등 반환.
- 권한: 현재 세션(또는 JWT)의 사용자 ID를 `created_by`로 저장.
- Validation: 파일 MIME(image/png/jpeg/webp/gif) 제한, 최대 파일 크기(예: 5MB), `Content-Type` 검증.

### 4.2 게시글 저장/수정과의 연계
- 게시글 수신 DTO에는 `inlineImageIds?: number[]`(에디터가 `img` 태그로 참조한 이미지 ID 목록) 또는 `inlineImageUrls?: string[]`(URL을 순회하여 DB에 존재 여부 확인) 필드를 추가.
- 저장 시 서비스는 전달된 `inlineImageIds` 기준으로 `content_images` 행의 `owner_type`, `owner_id`를 게시글 ID로 채우고, `deleted_at`이 없는 행만 유지.
- 기존에 연결된 이미지 중 요청에 없는 ID는 `deleted_at`을 채워 soft delete하고 S3 객체도 함께 삭제할지 여부를 플래그(`removeUnusedInlineImages`)로 제어합니다.

### 4.3 이미지 삭제 API (선택)
- `DELETE /api/v1/content-images/{imageId}`
  - 권한 체크 후 `content_images`에서 `deleted_at`을 채우고 S3도 삭제.
- 이 엔드포인트 선택은 관리 페이지, preview 모드, 혹은 에디터에서 직접 제거 시 필요.

## 5. 프론트엔드 흐름
1. 에디터에서 이미지 삽입 시 즉시 `attachments[]`가 아닌 별도 `inline image upload` API 호출.
2. 응답으로 받은 `imageUrl`과 `imageId`를 `<img src>`에 넣고, `inlineImageIds` 배열에 식별자를 함께 보관.
3. 게시글 저장 시 `inlineImageIds`를 DTO에 포함하여 백엔드로 전달.
4. 이미지가 게시글에 포함되지 않게 수정되면 `inlineImageIds`에서 제거하고, 백엔드 삭제 플래그(`removeUnusedInlineImages`)를 `true`로 보내어 정리.
5. 에디터 클립보드 붙여넣기 시에도 같은 흐름으로 API를 호출하여 `img` URL로 바꿔넣도록 합니다.
6. 기존 base64 처리 로직 제거하고 `content` 필드에는 `<img src="https://...">`만 저장하도록 정리합니다.

## 6. 운영 및 보안 고려
- S3 키 생성 시 사용자 입력을 sanitize하여 path traversal을 방지합니다.
- 업로드된 이미지에는 CDN TTL, 캐시 헤더를 적용할 수 있도록 `S3ClientService` 커스텀 헤더를 활용합니다.
- 최대 이미지 수(예: 게시글당 20개)를 프론트/백엔드에서 검증하여 과도한 저장을 막습니다.
- 이미지 삭제 시 S3 `deleteObject` 후 `content_images`에 `deleted_at`을 기록, soft delete로 DB 조회 필터링.
- 글 작성자가 아닌 다른 사용자의 이미지는 관리 불가하도록 `created_by` 또는 `owner_type/owner_id`와 인증 ID를 비교 검증.

## 7. 테스트 및 마이그레이션
- 테스트
  - 업로드: valid image → S3 업로드 + DB row, `imageUrl`이 S3 경로인지 확인.
  - `inlineImageIds`를 포함한 게시글 생성 → `content_images` owner 정보 채워짐.
  - 이미지 제거 → soft delete + S3 삭제.
- 마이그레이션
  - `lh_cs__content_images` 테이블 생성 SQL(기존 `content_attachments`와 구조 유사) 추가.
  - 기존 base64 저장 데이터를 정리하려면 게시글 내 `data:image/` 를 파싱하여 `inline image upload` API로 재처리하거나 추후 스크립트로 대체.

## 8. 연동 문서화
- Swagger에 다음 모델 등록
  - `ContentInlineImageUploadResponse`, `ContentInlineImageMetadata`
  - 게시글 생성/수정 DTO에 `inlineImageIds`, `removeUnusedInlineImages` 등 필드 추가.
- 프론트/백엔드 공통 컨벤션 문서(`docs/deployment` 등)에 새로운 API 명세 추가 및 `pnpm --filter lh-cs-fe lint:naming` 기준으로 `inline-image` 카멜/kebab 규칙 검증.
