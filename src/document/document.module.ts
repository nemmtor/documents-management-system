/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateDocumentCommandHandler } from './commands/create-document.handler';
import { UpdateDocumentContentCommandHandler } from './commands/update-document-content.handler';
import { DocumentDb } from './document.db';
import { DocumentHttpController } from './document.http-controller';
import { DocumentLogger } from './document.logger';
import { DocumentRepository } from './document.repository';
import { DocumentContentUpdatedEventHandler } from './events/document-content-updated.handler';
import { GetDocumentQueryHandler } from './queries/get-document.handler';

const queryHandlers = [GetDocumentQueryHandler] as const;
const commandHandlers = [
  UpdateDocumentContentCommandHandler,
  CreateDocumentCommandHandler,
] as const;
const eventHandlers = [DocumentContentUpdatedEventHandler] as const;

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'MAIN_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5672'],
          queue: 'main_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [DocumentHttpController],
  providers: [
    DocumentDb,
    DocumentRepository,
    DocumentLogger,
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,
  ],
})
export class DocumentModule {}
