import { Logger } from '@nestjs/common';

const logger = new Logger('ConfigWarning');

type EnvMap = Record<string, string | number | undefined | null>;

export function warnMissingEnvVars(configName: string, envMap: EnvMap): void {
  const missingKeys = Object.entries(envMap)
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);

  if (!missingKeys.length) {
    return;
  }

  logger.warn(
    `[${configName}] 다음 환경변수가 설정되지 않았습니다: ${missingKeys.join(', ')}`
  );
}
