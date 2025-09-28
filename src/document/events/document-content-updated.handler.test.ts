import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { DocumentLogger } from '../document.logger';
import { CONTRACT_SERVICE_QUEUE_CLIENT } from '../document.tokens';
import { DocumentContentUpdatedEvent } from './document-content-updated.event';
import { DocumentContentUpdatedEventHandler } from './document-content-updated.handler';

describe('DocumentContentUpdatedEventHandler', () => {
  let eventHandler: DocumentContentUpdatedEventHandler;
  let documentLogger: DocumentLogger;
  let mainQueueClient: ClientProxy;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        DocumentContentUpdatedEventHandler,
        { provide: DocumentLogger, useValue: { log: jest.fn() } },
        {
          provide: CONTRACT_SERVICE_QUEUE_CLIENT,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();
    eventHandler = mod.get(DocumentContentUpdatedEventHandler);
    documentLogger = mod.get(DocumentLogger);
    mainQueueClient = mod.get(CONTRACT_SERVICE_QUEUE_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should log information about sending 'document-content-updated' event", () => {
    const logSpy = jest.spyOn(documentLogger, 'log');
    eventHandler.handle(new DocumentContentUpdatedEvent({ documentId: '1' }));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('document-content-updated'),
    );
  });

  it('should emit DocumentContentUpdatedEvent via main queue', () => {
    const emitSpy = jest.spyOn(mainQueueClient, 'emit');
    const event = new DocumentContentUpdatedEvent({ documentId: '1' });
    eventHandler.handle(event);

    expect(emitSpy).toHaveBeenCalledWith('document-content-updated', event);
  });
});
