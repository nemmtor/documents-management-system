import { randomUUID } from 'node:crypto';
import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { DocumentAggregate } from '../document.aggregate';
import { DocumentRepository } from '../document.repository';
import { CreateDocumentCommand } from './create-document.command';

@CommandHandler(CreateDocumentCommand)
export class CreateDocumentCommandHandler
  implements ICommandHandler<CreateDocumentCommand>
{
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateDocumentCommand) {
    const document = this.publisher.mergeObjectContext(
      new DocumentAggregate({
        id: randomUUID(),
        createdAt: new Date(),
        content: command.payload.content,
      }),
    );

    await this.documentRepository.persist(document);
    document.commit();

    return {
      aggregateId: document.id,
    };
  }
}
