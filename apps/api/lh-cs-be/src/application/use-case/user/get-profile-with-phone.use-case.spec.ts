import { NotFoundException } from '@nestjs/common';
import { GetProfileWithPhoneUseCase } from './get-profile-with-phone.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';

describe('GetProfileWithPhoneUseCase', () => {
  let useCase: GetProfileWithPhoneUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let phoneEncryptionService: jest.Mocked<PhoneEncryptionService>;

  const mockUser: any = {
    id: 'user-1',
    phoneEncrypted: Buffer.from('encrypted'),
    phoneIv: Buffer.from('iv'),
    phoneTag: Buffer.from('tag'),
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as any;

    phoneEncryptionService = {
      decrypt: jest.fn(),
    } as any;

    useCase = new GetProfileWithPhoneUseCase(
      userRepository,
      phoneEncryptionService
    );
  });

  it('사용자 정보와 복호화된 전화번호를 반환한다', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    phoneEncryptionService.decrypt.mockReturnValue('01012345678');

    const result = await useCase.execute('user-1');

    expect(result.user).toBe(mockUser);
    expect(result.phoneNumber).toBe('01012345678');
    expect(phoneEncryptionService.decrypt).toHaveBeenCalledWith({
      encrypted: mockUser.phoneEncrypted,
      iv: mockUser.phoneIv,
      authTag: mockUser.phoneTag,
    });
  });

  it('사용자를 찾을 수 없으면 예외를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('전화번호 데이터가 없으면 null을 반환한다', async () => {
    userRepository.findById.mockResolvedValue({
      ...mockUser,
      phoneEncrypted: null,
      phoneIv: null,
      phoneTag: null,
    });

    const result = await useCase.execute('user-1');

    expect(result.phoneNumber).toBeNull();
    expect(phoneEncryptionService.decrypt).not.toHaveBeenCalled();
  });
});
