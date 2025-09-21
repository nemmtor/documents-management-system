import { Command } from '@nestjs/cqrs';

export class CreateContractCommand extends Command<{ aggregateId: string }> {
  constructor(public readonly payload: { attachmentIds: string[] }) {
    super();
  }
}
