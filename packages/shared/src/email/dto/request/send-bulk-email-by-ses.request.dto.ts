export class SendBulkEmailBySesRequestDto {
  emails!: string[];
  subject!: string;
  mailBody!: string;
}
