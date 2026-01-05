import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import { UpdateUserUseCase } from '@/application/use-case/user';
import { UpdateUserByAdminUseCase } from './update-user-by-admin.use-case';
import { UserRoleEnum } from '@/infrastructure/repository/entity';

describe('UpdateUserByAdminUseCase', () => {
  let useCase: UpdateUserByAdminUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as any;

    updateUserUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new UpdateUserByAdminUseCase(
      userRepository,
      updateUserUseCase
    );
  });

  it('ADMIN 사용자를 업데이트한다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      role: UserRoleEnum.ADMIN,
    } as any);
    updateUserUseCase.execute.mockResolvedValue({
      id: 'user-1',
      name: 'updated',
    } as any);

    const result = await useCase.execute('user-1', { name: 'updated' });

    expect(updateUserUseCase.execute).toHaveBeenCalledWith('user-1', {
      name: 'updated',
    });
    expect(result).toEqual({ id: 'user-1', name: 'updated' });
  });

  it('CONSULTANT 사용자도 업데이트할 수 있다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-2',
      role: UserRoleEnum.CONSULTANT,
    } as any);
    updateUserUseCase.execute.mockResolvedValue({
      id: 'user-2',
    } as any);

    await useCase.execute('user-2', { department: 'Sales' });

    expect(updateUserUseCase.execute).toHaveBeenCalled();
  });

  it('대상 사용자가 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { name: 'test' })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('ADMIN/CONSULTANT 외 역할 사용자는 수정할 수 없다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-3',
      role: UserRoleEnum.USER,
    } as any);

    await expect(
      useCase.execute('user-3', { name: 'blocked' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('수정하려는 role이 허용되지 않으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-4',
      role: UserRoleEnum.ADMIN,
    } as any);

    await expect(
      useCase.execute('user-4', { role: UserRoleEnum.USER })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(updateUserUseCase.execute).not.toHaveBeenCalled();
  });
});
