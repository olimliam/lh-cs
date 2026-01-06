// Statistics API Types
// Backend DTO들을 TypeScript 인터페이스로 정의

// Enums
export enum AdminLogActionTypeEnum {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  CHANGE_NAME = 'CHANGE_NAME',
  CHANGE_DEPARTMENT = 'CHANGE_DEPARTMENT',
  CHANGE_PHOTO = 'CHANGE_PHOTO',
  CHANGE_ROLE = 'CHANGE_ROLE',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  CHANGE_STATUS = 'CHANGE_STATUS',
}

// export enum LoginLogActionTypeEnum {
//   TRY_LOGIN = 'try_login',
//   SUCCESS_LOGIN = 'success_login',
//   FAIL_LOGIN = 'fail_login',
// }

export enum LoginFailReasonEnum {
  FAIL_PASSWORD = 'Fail Password',
  FAIL_USERNAME = 'Fail Username',
  BLOCK_ACCOUNT = 'Block Account',
  NOT_ALLOW_IP = 'Not Allow IP',
  SERVER_ERROR = '500',
}

export enum ConsultationLogActionTypeEnum {
  CONSULTATION_CREATE = 'CONSULTATION_CREATE',
  COUNSELOR_ENTER = 'COUNSELOR_ENTER',
  ADMIN_ENTER = 'ADMIN_ENTER',
  VISITOR_ENTER = 'VISITOR_ENTER',
  COUNSELOR_EXIT = 'COUNSELOR_EXIT',
  VISITOR_EXIT = 'VISITOR_EXIT',
  DRAWING_MODE_START = 'DRAWING_MODE_START',
  DRAWING_MODE_END = 'DRAWING_MODE_END',
  POP_OPEN = 'POP_OPEN',
  POP_CLOSE = 'POP_CLOSE',
  CONSULTATION_DESTROY = 'CONSULTATION_DESTROY',
}

export enum FreeTourLogActionTypeEnum {
  VISITOR_ENTER = 'VISITOR_ENTER',
  VISITOR_EXIT = 'VISITOR_EXIT',
  MOVE = 'MOVE',
  POP_OPEN = 'POP_OPEN',
  POP_CLOSE = 'POP_CLOSE',
}

// Request Types
export interface CreateAdminLogRequest {
  actionType: AdminLogActionTypeEnum;
  actionValue?: string;
  counselorId: string;
  device?: string;
  ipAddress?: string;
}

// export interface CreateLoginLogRequest {
//   actionType: LoginLogActionTypeEnum;
//   actionValue?: string;
//   counselorId?: string;
//   device?: string;
//   ipAddress?: string;
// }

export interface CreateConsultationLogRequest {
  actionType: ConsultationLogActionTypeEnum;
  actionValue?: string;
  consultationId?: string;
  counselorId?: string;
  tourId?: string;
  facilityId?: string;
  device?: string;
  ipAddress?: string;
}

export interface CreateFreeTourLogRequest {
  actionType: FreeTourLogActionTypeEnum;
  actionValue?: string;
  sessionId?: string;
  tourId?: string;
  facilityId?: string;
  device?: string;
  ipAddress?: string;
}

// Response Types
export interface CreateLogResponse {
  id: string;
  success: boolean;
  createdAt: Date;
  message: string;
}
