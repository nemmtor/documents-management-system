/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongoClientModule } from '../mongo-client.module';
import { CreateDocumentCommandHandler } from './commands/create-document.handler';
import { UpdateDocumentContentCommandHandler } from './commands/update-document-content.handler';
import { DocumentConfig, documentConfig } from './document.config';
import {
  CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN,
  DOCUMENT_DB_CLIENT,
} from './document.constants';
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

const DocumentDbClient = MongoClientModule.forFeatureAsync({
  name: DOCUMENT_DB_CLIENT,
  imports: [ConfigModule.forFeature(documentConfig)],
  useFactory: async (config: DocumentConfig) => config.database,
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
    DocumentDbClient,
    ContractServiceQueueClient,
  ],
  controllers: [DocumentHttpController],
  exports: [ConfigModule],
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
