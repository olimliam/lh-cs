export class ChangePasswordCommand {
  constructor(userId: string, currentPassword: string, newPassword: string) {
    this.userId = userId;
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }

  userId: string;
  currentPassword: string;
  newPassword: string;
}
