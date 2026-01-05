import { InternalServerErrorException } from '@nestjs/common';
import { PhoneEncryptionService } from './phone-encryption.service';

export const normalizePhoneNumber = (phone: string): string =>
  phone.replace(/[^0-9]/g, '');

export const isValidPhoneNumberLength = (phone: string): boolean =>
  /^\d{10,11}$/.test(phone);

export const decryptPhoneNumber = (
  phoneEncryptionService: PhoneEncryptionService,
  user: {
    phoneEncrypted?: Buffer | null;
    phoneIv?: Buffer | null;
    phoneTag?: Buffer | null;
  }
): string | null => {
  if (!user.phoneEncrypted || !user.phoneIv || !user.phoneTag) {
    return null;
  }

  try {
    return phoneEncryptionService.decrypt({
      encrypted: user.phoneEncrypted,
      iv: user.phoneIv,
      authTag: user.phoneTag,
    });
  } catch (error) {
    throw new InternalServerErrorException('전화번호 복호화에 실패했습니다.');
  }
};
