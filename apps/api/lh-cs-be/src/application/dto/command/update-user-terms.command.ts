export interface UpdateUserTermAgreement {
  termsId: string;
  agreed: boolean;
}

export class UpdateUserTermsCommand {
  constructor(
    public readonly userId: string,
    public readonly agreements: UpdateUserTermAgreement[]
  ) {}
}
