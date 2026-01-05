import { registerAs } from '@nestjs/config';
import {
  buildAttachmentMessages,
  parseAttachmentMaxSizeBytes,
} from '@/common/utils/attachment.util';

export const attachmentConfig = registerAs('attachment', () => {
  const maxSizeBytes = parseAttachmentMaxSizeBytes(
    process.env.ATTACHMENT_MAX_SIZE
  );

  const messages = buildAttachmentMessages(maxSizeBytes);

  return {
    maxSizeBytes,
    ...messages,
  };
});

export type AttachmentConfig = ReturnType<typeof attachmentConfig>;
