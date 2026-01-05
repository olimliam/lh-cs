import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateProfileRequest } from './update-profile.request';

describe('UpdateProfileRequest validation', () => {
  const basePayload = {
    name: '홍길동',
    department: '상담운영팀',
    phoneNumber: '01012345678',
  };

  it('parses boolean true into boolean false', () => {
    const dto = plainToInstance(UpdateProfileRequest, {
      ...basePayload,
      isEditProfileImage: true,
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.isEditProfileImage).toBe(true);
  });

  it('parses boolean false into boolean false', () => {
    const dto = plainToInstance(UpdateProfileRequest, {
      ...basePayload,
      isEditProfileImage: false,
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.isEditProfileImage).toBe(false);
  });

  it('parses string "false" into boolean false', () => {
    const dto = plainToInstance(UpdateProfileRequest, {
      ...basePayload,
      isEditProfileImage: 'false',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.isEditProfileImage).toBe(false);
  });

  it('parses string "true" into boolean true', () => {
    const dto = plainToInstance(UpdateProfileRequest, {
      ...basePayload,
      isEditProfileImage: 'true',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.isEditProfileImage).toBe(true);
  });
});
