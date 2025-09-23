import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { CannotSignContractWithUnseenAttachmentsError } from '../errors/cannot-sign-contract-with-unseen-attachments.error';
import { ContractNotFoundError } from '../errors/contract-not-found.error';

export class SignContractCommand extends Command<
  Result<
    void,
    CannotSignContractWithUnseenAttachmentsError | ContractNotFoundError
  >
> {
  constructor(public readonly payload: { contractId: string }) {
    super();
  }
}
