/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongoClientModule } from '../mongo-client.module';
import { CreateDocumentCommandHandler } from './commands/create-document.handler';
import { UpdateDocumentContentCommandHandler } from './commands/update-document-content.handler';
import { DocumentConfig, documentConfig } from './config/document.config';
import {
  CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN,
  DOCUMENT_READ_DB,
  DOCUMENT_WRITE_DB,
} from './document.constants';
import { DocumentHttpController } from './document.http-controller';
import { DocumentLogger } from './document.logger';
import { DocumentRepository } from './document.repository';
import { DocumentReadDbClient } from './document-read.db-client';
import { DocumentWriteDbClient } from './document-write.db-client';
import { DocumentContentUpdatedEventHandler } from './events/document-content-updated.handler';
import { DocumentCreatedEventHandler } from './events/document-created.handler';
import { GetDocumentQueryHandler } from './queries/get-document.handler';

const queryHandlers = [GetDocumentQueryHandler] as const;
const commandHandlers = [
  UpdateDocumentContentCommandHandler,
  CreateDocumentCommandHandler,
] as const;
const eventHandlers = [
  DocumentCreatedEventHandler,
  DocumentContentUpdatedEventHandler,
] as const;

const DocumentWriteDb = MongoClientModule.forFeatureAsync({
  name: DOCUMENT_WRITE_DB,
  imports: [ConfigModule.forFeature(documentConfig)],
  useFactory: async (config: DocumentConfig) => config.writeDatabase,
  inject: [documentConfig.KEY],
});

const DocumentReadDb = MongoClientModule.forFeatureAsync({
  name: DOCUMENT_READ_DB,
  imports: [ConfigModule.forFeature(documentConfig)],
  useFactory: async (config: DocumentConfig) => config.readDatabase,
  inject: [documentConfig.KEY],
});

const ContractServiceQueueClient = ClientsModule.registerAsync([
  {
    name: CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN,
    imports: [ConfigModule.forFeature(documentConfig)],
    useFactory: (config: DocumentConfig) => {
      const { host, name, password, port, user } = config.contractServiceQueue;
      return {
        transport: Transport.RMQ,
        options: {
          queue: name,
          urls: [`amqp://${user}:${password}@${host}:${port}`],
          queueOptions: {
            durable: false,
          },
        },
      };
    },
    inject: [documentConfig.KEY],
  },
]);

@Module({
  imports: [
    ConfigModule.forFeature(documentConfig),
    CqrsModule,
    DocumentWriteDb,
    DocumentReadDb,
    ContractServiceQueueClient,
  ],
  controllers: [DocumentHttpController],
  exports: [ConfigModule],
  providers: [
    DocumentWriteDbClient,
    DocumentReadDbClient,
    DocumentRepository,
    DocumentLogger,
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,
  ],
})
export class DocumentModule {}
