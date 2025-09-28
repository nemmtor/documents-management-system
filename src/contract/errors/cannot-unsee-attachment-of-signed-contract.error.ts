import { CustomError } from 'ts-custom-error';

export class CannotUnseeAttachmentOfSignedContract extends CustomError {
  public override readonly name = 'CannotUnseeAttachmentOfSignedContract';

  constructor(public readonly contractId: string) {
    super();
  }
}
