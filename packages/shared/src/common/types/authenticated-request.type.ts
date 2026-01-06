import { CurrentUserType } from '@/account';
import { Request } from 'express';
// Create a custom request type
export interface AuthenticatedRequest extends Request {
  user: CurrentUserType;
  ip: string;
  protocol: string;
  originalUrl: string;
}
