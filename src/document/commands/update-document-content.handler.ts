import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
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
    const document = this.publisher.mergeObjectContext(
      await this.documentRepository.getOneById(command.payload.documentId),
    );

    document.updateContent(command.payload.content);
    await this.documentRepository.persist(document);
    document.commit();

    return {
      aggregateId: document.id,
    };
  }
}
