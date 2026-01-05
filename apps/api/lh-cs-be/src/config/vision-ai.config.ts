import { warnMissingEnvVars } from '@/config/config-warning.util';
import { registerAs } from '@nestjs/config';

export interface VisionAiConfig {
  parentOrigin: string;
  childOrigin: string;
  appId: string;
  eptTtlSeconds: number;
  stTtlSeconds: number;
}

export default registerAs('visionAi', (): VisionAiConfig => {
  const parentOriginEnv = process.env.VISION_AI_PARENT_ORIGIN;
  const childOriginEnv = process.env.VISION_AI_CHILD_ORIGIN;
  const appIdEnv = process.env.VISION_AI_APP_ID;
  const eptTtlEnv = process.env.VISION_AI_EPT_TTL_SECONDS;
  const stTtlEnv = process.env.VISION_AI_ST_TTL_SECONDS;

  warnMissingEnvVars('visionAi', {
    VISION_AI_PARENT_ORIGIN: parentOriginEnv,
    VISION_AI_CHILD_ORIGIN: childOriginEnv,
    VISION_AI_APP_ID: appIdEnv,
    VISION_AI_EPT_TTL_SECONDS: eptTtlEnv,
    VISION_AI_ST_TTL_SECONDS: stTtlEnv,
  });

  return {
    parentOrigin: parentOriginEnv ?? 'https://parent.example.com',
    childOrigin: childOriginEnv ?? 'https://child.example.com',
    appId: appIdEnv ?? 'vision-ai-app',
    eptTtlSeconds: parseInt(eptTtlEnv ?? '30', 10),
    stTtlSeconds: parseInt(stTtlEnv ?? '300', 10),
  };
});
