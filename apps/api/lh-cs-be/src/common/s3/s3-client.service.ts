import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface S3UploadResult {
  url: string;
  key: string;
}

// 파일 업로드 타입 정의
export interface UploadFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

export enum UploadPrefixEnum {
  PROFILE_IMAGES = 'profile-images',
  NOTIFICATIONS = 'notifications',
  QNA = 'qna',
}

@Injectable()
export class S3ClientService {
  private readonly logger = new Logger(S3ClientService.name);
  private readonly bucketName: string;
  private readonly region: string;
  private readonly s3Client: S3Client;
  private readonly profileImagePrefix: string;
  private readonly notificationPrefix: string;
  private readonly qnaPrefix: string;
  private readonly cdnPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.region =
      this.configService.get<string>('AWS_REGION') || 'ap-northeast-2';

    const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
    const cdnPrefix = this.configService.get<string>('AWS_CDN_BUCKET_PREFIX');

    if (!bucketName) {
      throw new Error('AWS S3 버킷 이름이 설정되어 있지 않습니다.');
    }

    this.bucketName = bucketName;

    if (!cdnPrefix) {
      throw new Error('AWS CDN 버킷 접두사가 설정되어 있지 않습니다.');
    }

    this.cdnPrefix = cdnPrefix;

    // ⚠️ CAUTION:경로 잘못 입력하면 모든 파일의 경로가 날아갈 수 있으니 주의 ☠️
    const profileImagePrefix =
      this.configService.get<string>('AWS_S3_BUCKET_PROFILE_IMAGE_PATH') ??
      UploadPrefixEnum.PROFILE_IMAGES;

    if (!profileImagePrefix) {
      throw new Error('AWS S3 프로필 이미지 경로가 설정되어 있지 않습니다.');
    }

    this.profileImagePrefix = this.normalizePrefix(profileImagePrefix);

    const notificationPrefix =
      this.configService.get<string>('AWS_S3_BUCKET_NOTIFICATION_PATH') ??
      UploadPrefixEnum.NOTIFICATIONS;
    const qnaPrefix =
      this.configService.get<string>('AWS_S3_BUCKET_QNA_PATH') ??
      UploadPrefixEnum.QNA;

    this.notificationPrefix = this.normalizePrefix(notificationPrefix);
    this.qnaPrefix = this.normalizePrefix(qnaPrefix);

    this.logger.verbose(
      `Initialized S3 client with bucketName=${this.bucketName}, profileImagePrefix=${this.profileImagePrefix}, notificationPrefix=${this.notificationPrefix}, qnaPrefix=${this.qnaPrefix}, region=${this.region}`
    );

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY'
    );

    this.s3Client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  /**
   * 이미지 파일을 S3에 업로드
   * @param file 업로드할 파일
   * @param folder S3 버킷 내 폴더 경로
   * @param preferredFilename 선호 파일명
   * @param prefixType 업로드 경로 종류
   * @returns 업로드된 파일의 URL과 키
   */
  async uploadImage(
    file: UploadFile,
    folder: string = '',
    prefixTypeOrPath: UploadPrefixEnum | string,
    preferredFilename?: string
  ): Promise<S3UploadResult> {
    try {
      const basePrefix =
        typeof prefixTypeOrPath === 'string'
          ? this.normalizePrefix(prefixTypeOrPath)
          : this.resolvePrefix(prefixTypeOrPath);
      this.ensurePrefix(basePrefix);
      const normalizedFilename = this.normalizeFilename(
        preferredFilename ?? file.originalname
      );
      const fileExtension =
        this.extractExtension(normalizedFilename) ??
        this.extractExtension(file.originalname) ??
        'bin';
      const normalizedFilenameWithExt = this.ensureExtension(
        normalizedFilename,
        fileExtension
      );
      const baseNameWithoutExt = this.stripExtension(normalizedFilenameWithExt);

      const prefixSegments = [
        basePrefix,
        folder?.replace(/^\/+|\/+$/g, ''),
      ].filter((segment) => segment);

      const safeNameForKey = this.normalizeForKey(baseNameWithoutExt);
      const key = [
        ...prefixSegments,
        `${uuidv4()}-${safeNameForKey}.${fileExtension}`,
      ].join('/');

      const contentDisposition =
        prefixTypeOrPath === UploadPrefixEnum.PROFILE_IMAGES ||
        basePrefix === this.profileImagePrefix
          ? undefined
          : this.buildAttachmentDisposition(normalizedFilenameWithExt);

      const putCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: contentDisposition,
        ACL: 'public-read',
      });

      await this.s3Client.send(putCommand);

      const url = `${this.cdnPrefix.replace(/\/+$/, '')}/${key}`;

      this.logger.log(`Image uploaded to S3: ${url}`);

      return {
        url,
        key,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown upload error';
      throw new Error(`이미지 업로드에 실패했습니다: ${message}`);
    }
  }

  /**
   * 범용 파일을 S3에 업로드합니다. 이미지 외 ZIP 등 바이너리 파일 업로드 시 사용합니다.
   * @param file 업로드할 파일
   * @param folder S3 버킷 내 폴더 경로
   */
  async uploadFile(
    file: UploadFile,
    folder: string = '',
    prefixType: UploadPrefixEnum | string,
    preferredFilename?: string
  ): Promise<S3UploadResult> {
    return this.uploadImage(file, folder, prefixType, preferredFilename);
  }

  async uploadNotificationAttachment(
    file: UploadFile,
    preferredFilename?: string
  ): Promise<S3UploadResult> {
    return this.uploadFile(file, '', this.notificationPrefix, preferredFilename);
  }

  async uploadQnaAttachment(
    file: UploadFile,
    preferredFilename?: string
  ): Promise<S3UploadResult> {
    return this.uploadFile(file, '', this.qnaPrefix, preferredFilename);
  }

  async uploadProfileImage(
    file: UploadFile,
    preferredFilename?: string,
    folder: string = ''
  ): Promise<S3UploadResult> {
    return this.uploadImage(
      file,
      folder,
      this.profileImagePrefix,
      preferredFilename
    );
  }

  private normalizeFilename(name: string): string {
    const trimmed = name.replace(/[/\\]/g, '').replace(/\s+/g, ' ').trim();
    if (!trimmed) {
      return 'attachment';
    }

    return trimmed.length > 255 ? trimmed.slice(0, 255) : trimmed;
  }

  private stripExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex <= 0) {
      return filename;
    }
    return filename.substring(0, lastDotIndex);
  }

  private extractExtension(filename: string): string | null {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
      return null;
    }
    return filename.substring(lastDotIndex + 1);
  }

  private ensureExtension(filename: string, extension: string): string {
    if (this.extractExtension(filename)) {
      return filename;
    }
    return `${filename}.${extension}`;
  }

  private normalizeForKey(filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return safe.length > 150 ? safe.slice(0, 150) : safe || 'file';
  }

  private normalizePrefix(prefix: string): string {
    return prefix.replace(/^\/+|\/+$/g, '');
  }

  private ensurePrefix(
    prefix: string | null | undefined
  ): asserts prefix is string {
    if (!prefix) {
      throw new Error('S3 업로드 경로가 설정되어 있지 않습니다.');
    }
  }

  private resolvePrefix(prefixType: UploadPrefixEnum): string {
    switch (prefixType) {
      case UploadPrefixEnum.PROFILE_IMAGES:
        return this.profileImagePrefix;
      case UploadPrefixEnum.NOTIFICATIONS:
        return this.notificationPrefix;
      case UploadPrefixEnum.QNA:
        return this.qnaPrefix;
      default:
        throw new Error('지원되지 않는 업로드 경로입니다.');
    }
  }

  private buildAttachmentDisposition(filename: string): string {
    const encoded = encodeURIComponent(filename);
    return `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`;
  }

  /**
   * S3에서 파일 삭제
   * @param key 삭제할 파일의 키
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);

      this.logger.log(`File deleted from S3: ${key}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown delete error';
      this.logger.error(`Failed to delete file: ${message}`);
      throw new Error(`파일 삭제에 실패했습니다: ${message}`);
    }
  }

  /**
   * 파일 URL에서 S3 키 추출
   * @param url S3 파일 URL
   * @returns S3 키
   */
  extractKeyFromUrl(url: string): string | null {
    const { pathname } = new URL(url);
    return pathname.substring(1, pathname.length) || null;
  }

  /**
   * 버킷 내에서 전달된 URL에 없는 파일 모두 삭제
   */
  async deleteUnlistedFiles(keepUrls: string[]): Promise<void> {
    if (!this.bucketName) {
      throw new Error('S3 버킷이 설정되어 있지 않습니다.');
    }

    const targetPrefix = this.profileImagePrefix;
    this.ensurePrefix(targetPrefix);

    try {
      this.logger.log(`Starting cleanup in S3 with prefix: ${targetPrefix}`);

      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: targetPrefix,
      });
      const listResponse = await this.s3Client.send(listCommand);
      const allKeys =
        listResponse.Contents?.map((obj) => obj.Key!).filter(Boolean) ?? [];

      const keepKeys = keepUrls
        .filter((url) => url !== null && url !== '')
        .map((url) => this.extractKeyFromUrl(url))
        .filter((key): key is string => !!key);

      const keysToDelete = allKeys.filter((key) => !keepKeys.includes(key));

      for (const key of keysToDelete) {
        await this.deleteFile(key);
      }

      this.logger.log(
        `🧹 Cleaned up ${keysToDelete.length} files from S3 (bucket=${this.bucketName})`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown cleanup error';
      this.logger.error(`Failed to delete unlisted files: ${message}`);
      throw new Error(`파일 정리에 실패했습니다: ${message}`);
    }
  }
}
