import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/infrastructure/repository/user.repository';

@Injectable()
export class VisionAiProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async getNickname(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.name;
  }
}
