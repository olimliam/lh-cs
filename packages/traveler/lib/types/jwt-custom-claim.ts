export interface jwtCustomClaim {
  // custom claim
  userID: number;
  elypecsStudioSurvey: boolean;
  // default claim
  exp: number;
  iat: number;
  iss: string;
}
