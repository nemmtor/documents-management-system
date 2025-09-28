import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN } from '../document.constants';
import { DocumentLogger } from '../document.logger';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';

@EventsHandler(DocumentContentUpdatedEvent)
export class DocumentContentUpdatedEventHandler
  implements IEventHandler<DocumentContentUpdatedEvent>
{
  constructor(
    @Inject(CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN)
    private readonly contractServiceQueueClient: ClientProxy,
    private readonly logger: DocumentLogger,
  ) {}

  handle(event: DocumentContentUpdatedEvent) {
    this.logger.log(
      `Sending 'document-content-updated' for documentId: ${event.payload.documentId}`,
    );
    this.contractServiceQueueClient.emit('document-content-updated', event);
  }
}
