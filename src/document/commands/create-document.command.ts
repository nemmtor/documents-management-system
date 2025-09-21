import { Command } from '@nestjs/cqrs';

export class CreateDocumentCommand extends Command<{
  aggregateId: string;
}> {
  constructor(public readonly payload: { content: string }) {
    super();
  }
}
