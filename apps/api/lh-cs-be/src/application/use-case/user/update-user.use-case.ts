import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '@/application/service/phone-encryption.service';
import {
  isValidPhoneNumberLength,
  normalizePhoneNumber,
} from '@/application/service/user-phone.helper';
import { UpdateUserDto } from '@/application/dto/user/user.dto';

export interface UpdateUserUseCasePayload {
  username?: string;
  name?: string;
  department?: string | null;
  phoneNumber?: string;
  profileImageUrl?: string | null;
  role?: UserRoleEnum;
  status?: UserStatusEnum;
  approvalStatus?: UserApprovalStatusEnum;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(
    userId: string,
    payload: UpdateUserUseCasePayload
  ): Promise<UserEntity> {
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: UpdateUserDto = {};

    if (typeof payload.username !== 'undefined') {
      const trimmedUsername = payload.username.trim();

      if (!/^\d{6,20}$/.test(trimmedUsername)) {
        throw new BadRequestException('아이디는 숫자 6~20자리여야 합니다.');
      }

      const existingUser = await this.userRepository.findByUsername(
        trimmedUsername
      );
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('이미 사용 중인 아이디입니다.');
      }

      updateData.username = trimmedUsername;
    }

    if (typeof payload.name !== 'undefined') {
      updateData.name = payload.name;
    }

    if (typeof payload.department !== 'undefined') {
      updateData.department = payload.department;
    }

    if (typeof payload.profileImageUrl !== 'undefined') {
      updateData.profileImageUrl = payload.profileImageUrl;
    }

    if (typeof payload.role !== 'undefined') {
      updateData.role = payload.role;
    }

    if (typeof payload.status !== 'undefined') {
      updateData.status = payload.status;
    }

    if (typeof payload.approvalStatus !== 'undefined') {
      updateData.approvalStatus = payload.approvalStatus;
    }

    if (typeof payload.phoneNumber !== 'undefined') {
      const normalizedPhone = normalizePhoneNumber(payload.phoneNumber);

      if (!isValidPhoneNumberLength(normalizedPhone)) {
        throw new BadRequestException('잘못된 전화번호 형식입니다.');
      }

      const phoneHash = this.phoneEncryptionService.hash(normalizedPhone);
      const existingUserWithPhone =
        await this.userRepository.findByPhoneHash(phoneHash);

      if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
        throw new BadRequestException('이미 등록된 전화번호입니다.');
      }

      const phonePayload = this.phoneEncryptionService.encrypt(normalizedPhone);
      updateData.phoneHash = phonePayload.hash;
      updateData.phoneEncrypted = phonePayload.encrypted;
      updateData.phoneIv = phonePayload.iv;
      updateData.phoneTag = phonePayload.authTag;
      updateData.phoneVerifiedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('변경할 데이터가 없습니다.');
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return updatedUser;
  }
}
