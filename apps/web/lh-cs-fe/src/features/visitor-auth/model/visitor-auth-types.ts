export interface VisitorAuthState {
  visitorId: string | null;
  enterCode: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VisitorAuthRequest {
  visitorId: string;
  enterCode: string;
  consultationId: string;
}

export interface ConsultationVisitorInfo {
  visitorId: string | null;
  squareMeters: number | null;
  facilityName: string | null;
}

export interface VisitorAuthResponse {
  success: boolean;
  consultationId: string;
  consultantName: string;
  visitorId?: string;
  message?: string;
}

export interface VisitorIdCheckRequest {
  consultationId?: string;
}

export interface VisitorIdCheckResponse {
  success: boolean;
  visitorId: string;
  isExisting: boolean;
  message?: string;
}

export interface VisitorAuthError {
  code: string;
  message: string;
}
