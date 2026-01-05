import { SetMetadata } from '@nestjs/common';
import { VISION_AI_SCOPE_KEY } from '@/common/guard/vision-ai-scope.guard';

export const RequireVisionAiScope = (...scopes: string[]) =>
  SetMetadata(VISION_AI_SCOPE_KEY, scopes);
