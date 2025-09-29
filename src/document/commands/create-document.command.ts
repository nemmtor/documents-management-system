import { Command } from '@nestjs/cqrs';

export type CreateDocumentCommandResult = {
  documentId: string;
};
export type CreateDocumentCommandPayload = {
  content: string;
};

export class CreateDocumentCommand extends Command<CreateDocumentCommandResult> {
  constructor(public readonly payload: CreateDocumentCommandPayload) {
    super();
  }
}
