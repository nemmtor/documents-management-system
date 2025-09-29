import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN } from '../document.constants';
import { DocumentLogger } from '../document.logger';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';

@EventsHandler(DocumentContentUpdatedEvent)
export class DocumentContentUpdatedEventHandler
  implements IEventHandler<DocumentContentUpdatedEvent>
{
  constructor(
    @Inject(CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN)
    private readonly contractServiceQueueClient: ClientProxy,
    private readonly documentReadDbClient: DocumentReadDbClient,
    private readonly logger: DocumentLogger,
  ) {}

  handle(event: DocumentContentUpdatedEvent) {
    this.logger.log(
      `Sending 'document-content-updated' for documentId: ${event.payload.documentId}`,
    );
    this.contractServiceQueueClient.emit('document-content-updated', event);
    this.documentReadDbClient.updateOne(
      { _id: event.payload.documentId },
      {
        $set: {
          content: event.payload.content,
          updatedAt: event.payload.updatedAt,
        },
      },
    );
  }
}
