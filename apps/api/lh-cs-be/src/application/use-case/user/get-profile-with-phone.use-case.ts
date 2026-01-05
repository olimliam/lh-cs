import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { decryptPhoneNumber } from '../../service/user-phone.helper';
import { UserEntity } from '@/infrastructure/repository/entity';

@Injectable()
export class GetProfileWithPhoneUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(userId: string): Promise<{
    user: UserEntity;
    phoneNumber: string | null;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user,
      phoneNumber: decryptPhoneNumber(this.phoneEncryptionService, user),
    };
  }
}
