import { CustomError } from 'ts-custom-error';

export class ContractNotFoundError extends CustomError {
  public override readonly name = 'ContractNotFoundError';

  constructor(public readonly contractId: string) {
    super();
  }
}
