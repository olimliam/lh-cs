export const PASSWORD_RULE_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]{8,16}$/;
export const USERNAME_REGEX = /^\d{6}$/;
export const PHONE_REGEX = /^[0-9+()\s]{11}$/i;
export const VERIFICATION_REGEX = /^\d{6}$/;
export const IP_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
