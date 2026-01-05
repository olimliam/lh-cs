import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { ATTACHMENT_POLICY_DEFAULT } from '@/common/utils/attachment.util';

export function setupBodyLimits(
  app: NestExpressApplication,
  attachmentConf?: any
) {
  const maxSizeBytes =
    attachmentConf?.maxSizeBytes ?? ATTACHMENT_POLICY_DEFAULT.maxSizeBytes;

  app.use(express.json({ limit: maxSizeBytes }));
  app.use(express.urlencoded({ limit: maxSizeBytes, extended: true }));
}
