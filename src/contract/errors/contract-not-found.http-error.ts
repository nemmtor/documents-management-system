import { NotFoundException } from '@nestjs/common';

export class ContractNotFoundHttpError extends NotFoundException {
  public readonly name = 'ContractNotFoundHttpError';
  constructor(public readonly contractId: string) {
    super('Contract not found');
  }
}
