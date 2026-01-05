import 'express-session';
import { VisionAiEptPayload, VisionAiSessionTokenPayload } from '@/application/dto/vision-ai/vision-ai-token.payload';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    accessToken?: string;
    csrfToken?: string;
    loginTime?: number;
  }
}

declare module 'express' {
  interface Request {
    session: import('express-session').Session & Partial<import('express-session').SessionData>;
    visionAiEptPayload?: VisionAiEptPayload;
    visionAiSessionPayload?: VisionAiSessionTokenPayload;
  }
}
