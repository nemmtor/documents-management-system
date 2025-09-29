import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { DocumentContentUpdatedEventPayloadBuilder } from '../__test-utils__/document-content-updated-event-payload.builder';
import { CONTRACT_SERVICE_QUEUE_CLIENT_TOKEN } from '../document.constants';
import { DocumentLogger } from '../document.logger';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';
import { DocumentContentUpdatedEventHandler } from './document-content-updated.handler';

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
    const eventPayload = aDocumentContentUpdatedEventPayload().build();
    eventHandler.handle(new DocumentContentUpdatedEvent(eventPayload));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('document-content-updated'),
    );
  });

  it('should emit DocumentContentUpdatedEvent via contract service queue', () => {
    const emitSpy = jest.spyOn(contractServiceQueue, 'emit');
    const eventPayload = aDocumentContentUpdatedEventPayload().build();
    const event = new DocumentContentUpdatedEvent(eventPayload);
    eventHandler.handle(event);

    expect(emitSpy).toHaveBeenCalledWith(
      'document-content-updated',
      expect.objectContaining({
        constructor: DocumentContentUpdatedEvent,
        payload: eventPayload,
      }),
    );
  });

  it('should sync read db', async () => {
    const eventPayload = aDocumentContentUpdatedEventPayload()
      .withDocumentId('1')
      .withContent('new')
      .withUpdatedAt(new Date())
      .build();
    eventHandler.handle(new DocumentContentUpdatedEvent(eventPayload));
    const updateOneSpy = jest.spyOn(readDb, 'updateOne');

    expect(updateOneSpy).toHaveBeenCalledWith(
      { _id: '1' },
      {
        $set: {
          content: 'new',
          updatedAt: new Date(),
        },
      },
    );
  });
});

const aDocumentContentUpdatedEventPayload = () =>
  new DocumentContentUpdatedEventPayloadBuilder();
