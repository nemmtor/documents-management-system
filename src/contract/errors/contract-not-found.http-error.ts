import { NotFoundException } from '@nestjs/common';

export class ContractNotFoundHttpError extends NotFoundException {
  constructor(public readonly contractId: string) {
    super('Contract not found');
  }
}
