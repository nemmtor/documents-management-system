import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { AttachmentNotFoundError } from '../errors/attachment-not-found.error';
import { CannotUnseeAttachmentOfSignedContract } from '../errors/cannot-unsee-attachment-of-signed-contract.error';
import { ContractNotFoundError } from '../errors/contract-not-found.error';

export class UnseeAttachmentCommand extends Command<
  Result<
    void,
    | ContractNotFoundError
    | CannotUnseeAttachmentOfSignedContract
    | AttachmentNotFoundError
  >
> {
  constructor(
    public readonly payload: { contractId: string; attachmentId: string },
  ) {
    super();
  }
}
