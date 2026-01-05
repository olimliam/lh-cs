interface BaseJwtFields {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  jti?: string;
  scope?: string;
}

export interface VisionAiEptPayload extends BaseJwtFields {
  sub: string;
  iss: string;
  aud: string;
  origin: string;
  scope: string;
  jti: string;
  tokenUse: 'vision-ai-ept';
}

export interface VisionAiSessionTokenPayload extends BaseJwtFields {
  sub: string;
  iss: string;
  aud: string;
  scope: string;
  tokenUse: 'vision-ai-st';
}
