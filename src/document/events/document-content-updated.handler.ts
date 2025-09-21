import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { DocumentLogger } from '../document.logger';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';

@EventsHandler(DocumentContentUpdatedEvent)
export class DocumentContentUpdatedEventHandler
  implements IEventHandler<DocumentContentUpdatedEvent>
{
  constructor(
    @Inject('MAIN_QUEUE') private readonly mainQueueClient: ClientProxy,
    private readonly logger: DocumentLogger,
  ) {}

  handle(event: DocumentContentUpdatedEvent) {
    this.logger.log(
      `Sending 'document-content-updated' for documentId: ${event.payload.documentId}`,
    );
    this.mainQueueClient.emit('document-content-updated', event);
  }
}
