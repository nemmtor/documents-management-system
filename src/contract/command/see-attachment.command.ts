import { Command } from '@nestjs/cqrs';

export class SeeAttachmentCommand extends Command<void> {
  constructor(
    public readonly payload: { contractId: string; attachmentId: string },
  ) {
    super();
  }
}
