import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { DocumentCreatedEventPayloadBuilder } from '../__test-utils__/document-created-event-payload.builder';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentCreatedEvent } from './document-created.event';
import { DocumentCreatedEventHandler } from './document-created.handler';

describe('DocumentCreatedEventHandler', () => {
  let eventHandler: DocumentCreatedEventHandler;
  let readDb: DocumentReadDbClient;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        DocumentCreatedEventHandler,
        { provide: DocumentReadDbClient, useValue: { insertOne: jest.fn() } },
      ],
    }).compile();
    eventHandler = mod.get(DocumentCreatedEventHandler);
    readDb = mod.get(DocumentReadDbClient);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should sync read db', async () => {
    const eventPayload = aDocumentCreatedEventPayload()
      .withId('1')
      .withCreatedAt(new Date())
      .withUpdatedAt(new Date())
      .withContent('new')
      .build();
    eventHandler.handle(new DocumentCreatedEvent(eventPayload));
    const insertOneSpy = jest.spyOn(readDb, 'insertOne');

    expect(insertOneSpy).toHaveBeenCalledWith({
      _id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: 'new',
    });
  });
});

const aDocumentCreatedEventPayload = () =>
  new DocumentCreatedEventPayloadBuilder();
