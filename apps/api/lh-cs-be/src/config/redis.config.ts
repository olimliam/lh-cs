import { warnMissingEnvVars } from '@/config/config-warning.util';
import { registerAs } from '@nestjs/config';

export enum CacheLocationEnum {
  REDIS = 'redis',
  LOCAL_MEMORY = 'memory',
}

export type RedisConfig = {
  store: CacheLocationEnum;
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  useTLS: boolean;
  keyPrefix: string;
  cacheKeyPrefix: string;
  sessionTTL: number;
  cacheTtlMs: number;
};

export default registerAs(CacheLocationEnum.REDIS, (): RedisConfig => {
  const storeEnv = process.env.SESSION_STORE;
  const hostEnv = process.env.REDIS_HOST;
  const portEnv = process.env.REDIS_PORT;
  const usernameEnv = process.env.REDIS_USERNAME;
  const passwordEnv = process.env.REDIS_PASSWORD;
  const dbEnv = process.env.REDIS_DB;
  const useTlsEnv = process.env.REDIS_USE_TLS;
  const keyPrefixEnv = process.env.REDIS_KEY_PREFIX;
  const cacheKeyPrefixEnv = process.env.REDIS_CACHE_KEY_PREFIX;
  const sessionTTLEnv = process.env.SESSION_TTL_SEC;
  const cacheTtlMsEnv = process.env.CACHE_TTL_MS;

  warnMissingEnvVars('redis', {
    SESSION_STORE: storeEnv,
    REDIS_HOST: hostEnv,
    REDIS_PORT: portEnv,
    REDIS_USERNAME: usernameEnv,
    REDIS_PASSWORD: passwordEnv,
    REDIS_DB: dbEnv,
    REDIS_USE_TLS: useTlsEnv,
    REDIS_KEY_PREFIX: keyPrefixEnv,
    REDIS_CACHE_KEY_PREFIX: cacheKeyPrefixEnv,
    SESSION_TTL_SEC: sessionTTLEnv,
    CACHE_TTL_MS: cacheTtlMsEnv,
  });

  return {
    store: (storeEnv || CacheLocationEnum.LOCAL_MEMORY) as CacheLocationEnum,
    host: hostEnv || 'localhost',
    port: parseInt(portEnv ?? '6379', 10) || 6379,
    username: usernameEnv,
    password: passwordEnv,
    db: parseInt(dbEnv ?? '0', 10) || 0,
    useTLS: useTlsEnv === 'true',
    keyPrefix: keyPrefixEnv || 'lh-cs-sess:',
    cacheKeyPrefix: cacheKeyPrefixEnv || 'lh-cs-cache:',
    sessionTTL: parseInt(sessionTTLEnv ?? `${60 * 60 * 24}`, 10),
    cacheTtlMs: parseInt(cacheTtlMsEnv ?? `${600_000}`, 10) || 600_000,
  };
});
