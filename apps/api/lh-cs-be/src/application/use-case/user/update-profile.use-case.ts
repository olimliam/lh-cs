import { CustomException } from '@/common/exception/custom.exception';
import { UserErrorCode } from '@/common/exception/error/user-error-code.enum';
import { S3ClientService, UploadFile } from '@/common/s3/s3-client.service';
import { UserEntity } from '@/infrastructure/repository/entity';
import { UpdateProfileRequest } from '@/presentation/dto/request/update-profile.request';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UpdateUserDto } from '../../dto/user/user.dto';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import {
  isValidPhoneNumberLength,
  normalizePhoneNumber,
} from '../../service/user-phone.helper';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService,
    private readonly s3ClientService: S3ClientService
  ) {}

  async execute(
    userId: string,
    updateProfileDto: UpdateProfileRequest,
    profileImage?: Express.Multer.File
  ): Promise<UserEntity> {
    const maxProfileImageSize = 500 * 1024; // 500KB
    if (profileImage && profileImage.size > maxProfileImageSize) {
      throw new CustomException(
        UserErrorCode.USER_PROFILE_IMAGE_TOO_LARGE,
        HttpStatus.BAD_REQUEST
      );
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new CustomException(
        UserErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const payload: UpdateUserDto = {};

    payload.name = updateProfileDto.name;
    payload.department = updateProfileDto.department;

    if (typeof updateProfileDto.phoneNumber !== 'undefined') {
      const normalizedPhone = normalizePhoneNumber(
        updateProfileDto.phoneNumber
      );

      if (!isValidPhoneNumberLength(normalizedPhone)) {
        throw new CustomException(
          UserErrorCode.USER_PHONE_INVALID_FORMAT,
          HttpStatus.BAD_REQUEST
        );
      }

      const phoneHash = this.phoneEncryptionService.hash(normalizedPhone);
      const existingUserWithPhone =
        await this.userRepository.findByPhoneHash(phoneHash);

      if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
        throw new CustomException(
          UserErrorCode.USER_PHONE_ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST
        );
      }

      const phonePayload = this.phoneEncryptionService.encrypt(normalizedPhone);
      payload.phoneHash = phonePayload.hash;
      payload.phoneEncrypted = phonePayload.encrypted;
      payload.phoneIv = phonePayload.iv;
      payload.phoneTag = phonePayload.authTag;
      payload.phoneVerifiedAt = new Date();
    }

    if (updateProfileDto.isEditProfileImage) {
      if (profileImage) {
        const uploadPayload: UploadFile = {
          originalname: profileImage.originalname,
          buffer: profileImage.buffer,
          mimetype: profileImage.mimetype,
        };
        const { url } =
          await this.s3ClientService.uploadProfileImage(uploadPayload);
        payload.profileImageUrl = url;
      } else {
        const currentProfileImage = currentUser.profileImageUrl;
        if (currentProfileImage) {
          const key = currentProfileImage.startsWith('http')
            ? this.s3ClientService.extractKeyFromUrl(currentProfileImage)
            : currentProfileImage;

          if (key) {
            await this.s3ClientService.deleteFile(key);
          }
        }

        payload.profileImageUrl = null;
      }
    }

    if (Object.keys(payload).length === 0) {
      return currentUser;
    }

    const updatedUser = await this.userRepository.update(userId, payload);
    if (!updatedUser) {
      throw new CustomException(
        UserErrorCode.USER_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return updatedUser;
  }
}
