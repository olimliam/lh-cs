import { S3ClientService } from '@/common/s3/s3-client.service';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoveUnusedProfileImagesUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3ClientService: S3ClientService
  ) {}

  async execute(): Promise<void> {
    // Implementation for removing unused profile images
    const usedImages: string[] = await this.findUsedProfileImages();

    // s3에서 usedImages에 포함되지 않은 이미지 삭제 로직 추가 필요
    await this.s3ClientService.deleteUnlistedFiles(usedImages);
  }

  private async findUsedProfileImages(): Promise<string[]> {
    return this.userRepository.findUsedProfileImages();
  }
}
