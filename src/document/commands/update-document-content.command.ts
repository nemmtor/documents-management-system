import { Command } from '@nestjs/cqrs';

export class UpdateDocumentContentCommand extends Command<{
  aggregateId: string;
}> {
  constructor(
    public readonly payload: { documentId: string; content: string },
  ) {
    super();
  }
}
