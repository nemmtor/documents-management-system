import { CustomError } from 'ts-custom-error';

export class ContractNotFoundError extends CustomError {
  public readonly name = 'ContractNotFoundError';

  constructor(public readonly contractId: string) {
    super();
  }
}
