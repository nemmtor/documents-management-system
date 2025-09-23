import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { DocumentRepository } from '../document.repository';
import { UpdateDocumentContentCommand } from './update-document-content.command';

@CommandHandler(UpdateDocumentContentCommand)
export class UpdateDocumentContentCommandHandler
  implements ICommandHandler<UpdateDocumentContentCommand>
{
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateDocumentContentCommand) {
    const documentResult = await this.documentRepository.getOneById(
      command.payload.documentId,
    );

    if (documentResult.isErr()) {
      return documentResult;
    }

    const document = this.publisher.mergeObjectContext(documentResult.value);

    const updateContentResult = document.updateContent(command.payload.content);
    if (updateContentResult.isErr()) {
      return updateContentResult;
    }
    await this.documentRepository.persist(document);
    document.commit();

    return ok({
      aggregateId: document.id,
    });
  }
}
