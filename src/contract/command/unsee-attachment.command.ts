import { Command } from '@nestjs/cqrs';

export class UnseeAttachmentCommand extends Command<void> {
  constructor(
    public readonly payload: { contractId: string; attachmentId: string },
  ) {
    super();
  }
}
