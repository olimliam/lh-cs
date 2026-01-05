import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { KcmvpCryptoUtil } from './kcmvp-crypto.util';

type ConfigOverrides = Record<string, string | number>;

describe('KcmvpCryptoUtil', () => {
  const createCryptoUtil = (overrides: ConfigOverrides = {}) => {
    const baseConfig: ConfigOverrides = {
      PBKDF2_ITERATIONS: 1200,
      CURRENT_PEPPER_VERSION: 2,
      PASSWORD_PEPPER_V2: 'unit-test-pepper',
      DEFAULT_PASSWORD_PEPPER: 'fallback-pepper',
    };

    const configValues = { ...baseConfig, ...overrides };

    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (Object.prototype.hasOwnProperty.call(configValues, key)) {
          return configValues[key];
        }
        return defaultValue;
      }),
    } as unknown as ConfigService;

    return {
      util: new KcmvpCryptoUtil(configService),
      configService,
      configValues,
    };
  };

  it('generateSalt는 256비트 hex 문자열을 반환한다', () => {
    const { util } = createCryptoUtil();

    const salt = util.generateSalt();

    expect(salt).toMatch(/^[0-9a-f]+$/);
    expect(salt).toHaveLength(64);
  });

  it('derivePasswordHash는 정책 파라미터와 pepper를 사용해 결정적 해시를 생성한다', async () => {
    const password = 'TestPassword1!';
    const { util, configValues } = createCryptoUtil();

    const salt = util.generateSalt();
    const result = await util.derivePasswordHash(password, salt);

    const iterations = Number(configValues.PBKDF2_ITERATIONS);
    const expectedHash = crypto
      .pbkdf2Sync(
        password + String(configValues.PASSWORD_PEPPER_V2),
        salt,
        iterations,
        64,
        'sha256'
      )
      .toString('hex');

    expect(result.hash).toBe(expectedHash);
    expect(result.salt).toBe(salt);
    expect(result.kdfAlgo).toBe('pbkdf2-hmac-sha256');
    expect(result.kdfParams).toEqual({
      algorithm: 'sha256',
      iterations,
      hashLength: 64,
    });
    expect(result.pepperVersion).toBe(Number(configValues.CURRENT_PEPPER_VERSION));
    expect(result.hashCreatedAt).toBeInstanceOf(Date);
  });

  it('verifyPassword는 올바른 비밀번호에서 true를 반환하고 잘못된 비밀번호에서 false를 반환한다', async () => {
    const password = 'ComplexPw123!';
    const { util } = createCryptoUtil();

    const salt = util.generateSalt();
    const stored = await util.derivePasswordHash(password, salt);

    await expect(
      util.verifyPassword(
        password,
        stored.hash,
        stored.salt,
        stored.kdfParams,
        stored.pepperVersion
      )
    ).resolves.toBe(true);

    await expect(
      util.verifyPassword(
        'WrongPassword',
        stored.hash,
        stored.salt,
        stored.kdfParams,
        stored.pepperVersion
      )
    ).resolves.toBe(false);
  });

  it('pepper가 누락된 경우 기본 pepper로 해싱을 수행한다', async () => {
    const overrides: ConfigOverrides = {
      CURRENT_PEPPER_VERSION: 1,
      PBKDF2_ITERATIONS: 800,
      DEFAULT_PASSWORD_PEPPER: 'default-fallback',
    };
    const { util, configValues } = createCryptoUtil(overrides);

    const salt = util.generateSalt();
    const stored = await util.derivePasswordHash('Password!234', salt);

    const iterations = Number(configValues.PBKDF2_ITERATIONS);
    const expected = crypto
      .pbkdf2Sync('Password!234' + String(configValues.DEFAULT_PASSWORD_PEPPER), salt, iterations, 64, 'sha256')
      .toString('hex');

    expect(stored.hash).toBe(expected);
    expect(stored.pepperVersion).toBe(1);
  });

  it('isHashUpToDate는 반복 횟수 또는 pepper 버전이 뒤처지면 false를 반환한다', () => {
    const { util } = createCryptoUtil({
      PBKDF2_ITERATIONS: 1500,
      CURRENT_PEPPER_VERSION: 3,
      PASSWORD_PEPPER_V3: 'pepper3',
    });

    expect(
      util.isHashUpToDate({ algorithm: 'sha256', iterations: 2000, hashLength: 64 }, 3)
    ).toBe(true);

    expect(
      util.isHashUpToDate({ algorithm: 'sha256', iterations: 1000, hashLength: 64 }, 3)
    ).toBe(false);

    expect(
      util.isHashUpToDate({ algorithm: 'sha256', iterations: 2000, hashLength: 64 }, 2)
    ).toBe(false);
  });

  it('generateSecureToken과 generateHmac은 예상된 형식을 따른다', () => {
    const { util } = createCryptoUtil();

    const token = util.generateSecureToken(16);
    expect(token).toMatch(/^[0-9a-f]{32}$/);

    const hmac = util.generateHmac('data', 'key', 'sha256');
    const expected = crypto.createHmac('sha256', 'key').update('data').digest('hex');

    expect(hmac).toBe(expected);
  });
});
