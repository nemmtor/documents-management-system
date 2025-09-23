import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { AttachmentNotFoundError } from '../errors/attachment-not-found.error';
import { ContractNotFoundError } from '../errors/contract-not-found.error';

export class SeeAttachmentCommand extends Command<
  Result<void, ContractNotFoundError | AttachmentNotFoundError>
> {
  constructor(
    public readonly payload: { contractId: string; attachmentId: string },
  ) {
    super();
  }
}
