import { CustomError } from 'ts-custom-error';

export class CannotSignContractWithUnseenAttachmentsError extends CustomError {
  public override readonly name =
    'CannotSignContractWithUnseenAttachmentsError';

  constructor(readonly contractId: string) {
    super();
  }
}
