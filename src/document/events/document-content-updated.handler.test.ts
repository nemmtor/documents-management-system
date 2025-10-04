import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN } from '../document.constants';
import { DocumentLogger } from '../document.logger';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';
import { DocumentContentUpdatedEventHandler } from './document-content-updated.handler';

// TODO: double check tests
describe('DocumentContentUpdatedEventHandler', () => {
  let eventHandler: DocumentContentUpdatedEventHandler;
  let documentLogger: DocumentLogger;
  let contractServiceQueue: ClientProxy;
  let readDb: DocumentReadDbClient;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        DocumentContentUpdatedEventHandler,
        { provide: DocumentLogger, useValue: { log: jest.fn() } },
        { provide: DocumentReadDbClient, useValue: { updateOne: jest.fn() } },
        {
          provide: CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();
    eventHandler = mod.get(DocumentContentUpdatedEventHandler);
    documentLogger = mod.get(DocumentLogger);
    contractServiceQueue = mod.get(CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN);
    readDb = mod.get(DocumentReadDbClient);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should log information about sending 'document-content-updated' event", () => {
    const logSpy = jest.spyOn(documentLogger, 'log');
    eventHandler.handle(
      new DocumentContentUpdatedEvent({
        documentId: '1',
        content: 'new content',
        updatedAt: new Date(),
      }),
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('document-content-updated'),
    );
  });

  it('should emit DocumentContentUpdatedEvent via contract service queue', () => {
    const emitSpy = jest.spyOn(contractServiceQueue, 'emit');
    const event = new DocumentContentUpdatedEvent({
      documentId: '1',
      content: 'new content',
      updatedAt: new Date(),
    });
    eventHandler.handle(event);

    expect(emitSpy).toHaveBeenCalledWith('document-content-updated', event);
  });

  it('should sync read db', async () => {
    eventHandler.handle(
      new DocumentContentUpdatedEvent({
        documentId: '1',
        content: 'new content',
        updatedAt: new Date(),
      }),
    );
    const updateOneSpy = jest.spyOn(readDb, 'updateOne');

    expect(updateOneSpy).toHaveBeenCalledWith(
      { _id: '1' },
      {
        $set: {
          content: 'new content',
          updatedAt: new Date(),
        },
      },
    );
  });
});
