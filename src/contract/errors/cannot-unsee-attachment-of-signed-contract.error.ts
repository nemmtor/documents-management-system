import { CustomError } from 'ts-custom-error';

export class CannotUnseeAttachmentOfSignedContract extends CustomError {
  public readonly name = 'CannotUnseeAttachmentOfSignedContract';

  constructor(public readonly contractId: string) {
    super();
  }
}
