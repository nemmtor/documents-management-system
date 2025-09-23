import { CustomError } from 'ts-custom-error';

export class CannotSignContractWithUnseenAttachmentsError extends CustomError {
  public readonly name = 'CannotSignContractWithUnseenAttachmentsError';

  constructor(readonly contractId: string) {
    super();
  }
}
