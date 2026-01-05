import { registerAs } from '@nestjs/config';
import { warnMissingEnvVars } from '@/config/config-warning.util';

export interface SmsConfig {
  senderPhone: string;
  agentId: string;
}

export default registerAs('sms', (): SmsConfig => {
  const senderPhoneEnv = process.env.SMS_SENDER_PHONE;
  const agentIdEnv = process.env.SMS_AGENT_ID;

  warnMissingEnvVars('sms', {
    SMS_SENDER_PHONE: senderPhoneEnv,
    SMS_AGENT_ID: agentIdEnv,
  });

  return {
    senderPhone: senderPhoneEnv ?? '0559225946',
    agentId: agentIdEnv ?? 'DB Agent ID',
  };
});
