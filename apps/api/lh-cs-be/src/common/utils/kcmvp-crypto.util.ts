import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { getCurrentPasswordPolicy } from '../../config/kcmvp-policy.config';

/**
 * KCMVP 기준 준수 암호화 유틸리티
 *
 * 공공기관 요구사항에 따라 KCMVP 검증 암호모듈 기준으로 설계된
 * 비밀번호 해싱 및 키 관리 유틸리티
 *
 * 보안 정책:
 * - 암호화 알고리즘은 서버에서 강제 (클라이언트 선택 불가)
 * - PBKDF2-HMAC-SHA256/SHA512 고정 사용
 * - KCMVP 검증 모듈 기반 키 관리
 * - 정기적 파라미터 강화 및 마이그레이션 지원
 */
@Injectable()
export class KcmvpCryptoUtil {
  private readonly policy = getCurrentPasswordPolicy();

  constructor(private readonly configService: ConfigService) {}

  /**
   * 안전한 랜덤 salt 생성
   * KCMVP 검증 모듈의 RNG 사용 (Node.js crypto.randomBytes는 OpenSSL 기반)
   */
  generateSalt(length?: number): string {
    const saltLength = length || this.policy.salt.length;
    return crypto
      .randomBytes(saltLength)
      .toString(this.policy.salt.encoding as BufferEncoding);
  }

  /**
   * KCMVP 정책에 따른 비밀번호 해싱
   * 서버 정책으로 고정된 알고리즘만 사용
   * 평문 암호화에 사용자별 고유 salt 값을 적용한다.
   * 암호화 저장시 해시값이 저장되며, salt 값과 파라미터는 별도 필드에 저장한다.
   *
   * @param password 평문 비밀번호
   * @param salt 사용자별 고유 salt
   * @returns 해시 결과와 메타데이터
   */
  async derivePasswordHash(
    password: string,
    salt: string
  ): Promise<{
    hash: string;
    salt: string;
    kdfAlgo: string;
    kdfParams: {
      algorithm: string;
      iterations: number;
      hashLength: number;
    };
    pepperVersion: number;
    hashCreatedAt: Date;
  }> {
    // 서버 정책에서 고정된 파라미터 사용
    const iterations = Number(
      this.configService.get<number>(
        'PBKDF2_ITERATIONS',
        this.policy.pbkdf2.iterations
      )
    );
    const keyLength = this.policy.pbkdf2.keyLength;
    const digest = this.policy.pbkdf2.digest;
    const pepperVersion = this.getCurrentPepperVersion();

    // Pepper 적용 (HSM에서 관리)
    const pepper = await this.getPepper(pepperVersion);
    const combinedPassword = password + pepper;

    // PBKDF2-HMAC 해싱 (정책 고정)
    const hash = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        combinedPassword,
        salt,
        iterations,
        keyLength,
        digest,
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });

    return {
      hash: hash.toString('hex'),
      salt,
      kdfAlgo: this.policy.kdfAlgorithm, // 서버에서 강제된 알고리즘
      kdfParams: {
        algorithm: digest,
        iterations,
        hashLength: keyLength,
      },
      pepperVersion,
      hashCreatedAt: new Date(),
    };
  }

  /**
   * 비밀번호 검증
   * 타이밍 공격 방지를 위한 constant-time 비교
   */
  async verifyPassword(
    inputPassword: string,
    storedHash: string,
    salt: string,
    kdfParams: {
      algorithm: string;
      iterations: number;
      hashLength: number;
    },
    pepperVersion: number
  ): Promise<boolean> {
    try {
      // 저장된 파라미터로 동일한 해시 생성
      const pepper = await this.getPepper(Number(pepperVersion));
      const combinedPassword = inputPassword + pepper;

      // JSON에서 읽어온 값들을 명시적으로 number로 변환
      const iterations = Number(kdfParams.iterations);
      const hashLength = Number(kdfParams.hashLength);

      // console.log(
      //   '🔐 KCMVP verifyPassword - iterations:',
      //   iterations,
      //   'hashLength:',
      //   hashLength,
      //   'pepperVersion:',
      //   pepperVersion
      // );

      const hash = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
          combinedPassword,
          salt,
          iterations,
          hashLength,
          kdfParams.algorithm,
          (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
          }
        );
      });

      const computedHash = hash.toString('hex');

      // Constant-time 비교 (타이밍 공격 방지)
      return this.constantTimeCompare(computedHash, storedHash);
    } catch (error) {
      // 에러 발생 시에도 타이밍을 일정하게 유지
      const pepper = await this.getPepper(Number(pepperVersion));
      const combinedPassword = 'dummy' + pepper;

      // JSON에서 읽어온 값들을 명시적으로 number로 변환
      const iterations = Number(kdfParams.iterations);
      const hashLength = Number(kdfParams.hashLength);

      await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
          combinedPassword,
          salt,
          iterations,
          hashLength,
          kdfParams.algorithm,
          (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
          }
        );
      });

      return false;
    }
  }

  /**
   * 타이밍 공격 방지를 위한 constant-time 문자열 비교
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * 현재 pepper 버전 획득
   */
  private getCurrentPepperVersion(): number {
    return Number(
      this.configService.get<number>(
        'CURRENT_PEPPER_VERSION',
        this.policy.pepper.version
      )
    );
  }

  /**
   * Pepper 획득 (HSM/KMS 연동)
   * 현재는 환경변수에서 가져오지만, 실제 운영에서는 HSM API 호출
   */
  private async getPepper(version: number): Promise<string> {
    // TODO: HSM/KMS 연동 구현
    // 현재는 환경변수에서 가져오는 임시 구현
    const pepperKey = `PASSWORD_PEPPER_V${version}`;
    const pepper = this.configService.get<string>(pepperKey);

    if (!pepper) {
      // 기본 pepper (운영에서는 HSM에서 관리해야 함)
      console.warn(
        `Warning: Using default pepper for version ${version}. HSM integration required for production.`
      );

      const result = this.configService.get<string>(
        'DEFAULT_PASSWORD_PEPPER',
        'default-pepper-change-in-production'
      );
      return result;
    }

    return pepper;
  }

  /**
   * 해시 파라미터가 현재 정책을 만족하는지 확인
   * 주기적인 파라미터 강화를 위한 체크
   */
  isHashUpToDate(kdfParams: any, pepperVersion: number): boolean {
    const currentIterations = Number(
      this.configService.get<number>(
        'PBKDF2_ITERATIONS',
        this.policy.pbkdf2.iterations
      )
    );
    const currentPepperVersion = Number(
      this.configService.get<number>(
        'CURRENT_PEPPER_VERSION',
        this.policy.pepper.version
      )
    );

    // kdfParams.iterations도 number로 변환 (JSON에서 문자열일 수 있음)
    const iterations = Number(kdfParams.iterations);
    const pepper = Number(pepperVersion);

    return iterations >= currentIterations && pepper >= currentPepperVersion;
  }

  /**
   * 안전한 랜덤 토큰 생성 (비밀번호 재설정 등에 사용)
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * HMAC 기반 메시지 인증 코드 생성
   */
  generateHmac(
    data: string,
    key: string,
    algorithm: string = 'sha256'
  ): string {
    return crypto.createHmac(algorithm, key).update(data).digest('hex');
  }

  /**
   * 암호화 메트릭 및 성능 정보
   */
  getBenchmarkInfo(): {
    recommendedIterations: number;
    currentIterations: number;
    pepperVersion: number;
    algorithms: string[];
    policyVersion: string;
  } {
    return {
      recommendedIterations: this.policy.pbkdf2.iterations,
      currentIterations: this.configService.get<number>(
        'PBKDF2_ITERATIONS',
        this.policy.pbkdf2.iterations
      ),
      pepperVersion: this.configService.get<number>(
        'CURRENT_PEPPER_VERSION',
        this.policy.pepper.version
      ),
      algorithms: [this.policy.kdfAlgorithm, this.policy.fallbackAlgorithm],
      policyVersion: '1.0.0',
    };
  }
}
