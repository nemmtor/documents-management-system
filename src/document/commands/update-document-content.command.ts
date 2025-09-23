import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DocumentNotFoundError } from '../errors/document-not-found.error';
import { DocumentTooOldForContentUpdateError } from '../errors/document-too-old-for-content-update.error';

export class UpdateDocumentContentCommand extends Command<
  Result<void, DocumentNotFoundError | DocumentTooOldForContentUpdateError>
> {
  constructor(
    public readonly payload: { documentId: string; content: string },
  ) {
    super();
  }
}
