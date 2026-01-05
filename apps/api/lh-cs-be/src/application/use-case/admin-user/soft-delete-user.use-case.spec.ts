import { NotFoundException } from '@nestjs/common';
import { SoftDeleteUserUseCase } from './soft-delete-user.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

describe('SoftDeleteUserUseCase', () => {
  let useCase: SoftDeleteUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    useCase = new SoftDeleteUserUseCase(userRepository);
  });

  it('사용자가 존재하면 소프트 삭제한다', async () => {
    userRepository.findById.mockResolvedValue({ id: 'user-1' } as any);
    userRepository.update.mockResolvedValue({ id: 'user-1' } as any);

    await useCase.execute('user-1');

    expect(userRepository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        status: UserStatusEnum.DELETED,
        deletedAt: expect.any(Date),
      })
    );
    expect(userRepository.softDelete).toHaveBeenCalledWith('user-1');
  });

  it('사용자를 찾을 수 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
