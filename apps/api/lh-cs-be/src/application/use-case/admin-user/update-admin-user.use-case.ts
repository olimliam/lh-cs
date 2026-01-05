import { S3ClientService } from '@/common/s3/s3-client.service';
import { PhoneEncryptionService } from '@/application/service/phone-encryption.service';
import { decryptPhoneNumber } from '@/application/service/user-phone.helper';
import { UpdateUserUseCasePayload } from '@/application/use-case/user';
import { UserEntity } from '@/infrastructure/repository/entity';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Express } from 'express';

import { UpdateUserByAdminUseCase } from './update-user-by-admin.use-case';

const MAX_PROFILE_IMAGE_SIZE = 500 * 1024; // 500KB

export interface UpdateAdminUserCommand {
  userId: string;
  payload: UpdateUserUseCasePayload;
  profileImage?: Express.Multer.File;
  isEditProfileImage?: boolean;
}

export interface UpdateAdminUserResult {
  user: UserEntity;
  phoneNumber: string | null;
  updatedAt: string;
}

@Injectable()
export class UpdateAdminUserUseCase {
  constructor(
    private readonly updateUserByAdminUseCase: UpdateUserByAdminUseCase,
    private readonly userRepository: UserRepository,
    private readonly s3ClientService: S3ClientService,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(command: UpdateAdminUserCommand): Promise<UpdateAdminUserResult> {
    const { userId, payload, profileImage, isEditProfileImage } = command;

    const shouldEditProfileImage =
      typeof isEditProfileImage !== 'undefined'
        ? isEditProfileImage
        : Boolean(profileImage);

    const profileImageUrl = await this.prepareProfileImageUpdate(
      userId,
      shouldEditProfileImage,
      profileImage
    );

    const updatePayload =
      typeof profileImageUrl === 'undefined'
        ? payload
        : { ...payload, profileImageUrl };

    const updatedUser = await this.updateUserByAdminUseCase.execute(
      userId,
      updatePayload
    );

    const phoneNumber = decryptPhoneNumber(
      this.phoneEncryptionService,
      updatedUser
    );

    const updatedAt =
      updatedUser.updatedAt instanceof Date
        ? updatedUser.updatedAt.toISOString()
        : String(updatedUser.updatedAt);

    return {
      user: updatedUser,
      phoneNumber,
      updatedAt,
    };
  }

  private async prepareProfileImageUpdate(
    userId: string,
    shouldEditProfileImage: boolean,
    profileImage?: Express.Multer.File
  ): Promise<string | null | undefined> {
    if (!shouldEditProfileImage) {
      return undefined;
    }

    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (profileImage) {
      if (profileImage.size > MAX_PROFILE_IMAGE_SIZE) {
        throw new BadRequestException(
          '프로필 이미지는 500KB 이하 파일만 허용됩니다.'
        );
      }

      const uploadPayload = {
        originalname: profileImage.originalname,
        buffer: profileImage.buffer,
        mimetype: profileImage.mimetype,
      };

      const { url } =
        await this.s3ClientService.uploadProfileImage(uploadPayload);
      return url;
    }

    await this.deleteProfileImageIfExists(targetUser.profileImageUrl);
    return null;
  }

  private async deleteProfileImageIfExists(
    imageUrl?: string | null
  ): Promise<void> {
    if (!imageUrl) {
      return;
    }

    const key = imageUrl.startsWith('http')
      ? this.s3ClientService.extractKeyFromUrl(imageUrl)
      : imageUrl;

    if (key) {
      await this.s3ClientService.deleteFile(key);
    }
  }
}
