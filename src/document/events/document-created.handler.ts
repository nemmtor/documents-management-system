import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentCreatedEvent } from './document-created.event';

@EventsHandler(DocumentCreatedEvent)
export class DocumentCreatedEventHandler
  implements IEventHandler<DocumentCreatedEvent>
{
  constructor(private readonly documentReadDbClient: DocumentReadDbClient) {}

  async handle(event: DocumentCreatedEvent) {
    await this.documentReadDbClient.insertOne({
      _id: event.payload.id,
      createdAt: event.payload.createdAt,
      updatedAt: event.payload.updatedAt,
      content: event.payload.content,
    });
  }
}
