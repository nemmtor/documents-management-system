import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ok } from 'neverthrow';
import { DocumentAggregate } from '../document.aggregate';
import { DocumentRepository } from '../document.repository';
import { UpdateDocumentContentCommand } from './update-document-content.command';
import { UpdateDocumentContentCommandHandler } from './update-document-content.handler';

describe('UpdateDocumentContentCommandHandler', () => {
  let commandHandler: UpdateDocumentContentCommandHandler;
  let documentRepository: DocumentRepository;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        UpdateDocumentContentCommandHandler,
        {
          provide: DocumentRepository,
          useValue: {
            persist: jest.fn(),
            getOneById: jest.fn(() => ok()),
          },
        },
      ],
    }).compile();
    eventPublisher = mod.get(EventPublisher);
    documentRepository = mod.get(DocumentRepository);
    commandHandler = mod.get(UpdateDocumentContentCommandHandler);
  });

  it('should update document in storage', async () => {
    jest.spyOn(documentRepository, 'getOneById').mockResolvedValueOnce(
      ok(
        new DocumentAggregate({
          id: '1',
          content: 'hi',
          createdAt: new Date(),
        }),
      ),
    );
    await commandHandler.execute(
      new UpdateDocumentContentCommand({ documentId: '1', content: 'New' }),
    );

    expect(documentRepository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', content: 'New' }),
    );
  });

  it('should update document content', async () => {
    const documentAggregate = new DocumentAggregate({
      id: '1',
      content: 'hi',
      createdAt: new Date(),
    });
    jest
      .spyOn(documentRepository, 'getOneById')
      .mockResolvedValueOnce(ok(documentAggregate));
    const updateContentSpy = jest.spyOn(documentAggregate, 'updateContent');
    await commandHandler.execute(
      new UpdateDocumentContentCommand({ documentId: '1', content: 'New' }),
    );

    expect(updateContentSpy).toHaveBeenCalledWith('New');
  });

  it('should emit aggregate events', async () => {
    const documentAggregate = new DocumentAggregate({
      id: '1',
      content: 'hi',
      createdAt: new Date(),
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(documentAggregate);
    const commitSpy = jest.spyOn(documentAggregate, 'commit');

    await commandHandler.execute(
      new UpdateDocumentContentCommand({
        documentId: '1',
        content: 'Hello world',
      }),
    );

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });

  it('should return aggregate id', async () => {
    jest.spyOn(documentRepository, 'getOneById').mockResolvedValueOnce(
      ok(
        new DocumentAggregate({
          id: '1',
          content: 'hi',
          createdAt: new Date(),
        }),
      ),
    );
    const result = await commandHandler.execute(
      new UpdateDocumentContentCommand({
        documentId: '1',
        content: 'Hello world',
      }),
    );

    expect(result._unsafeUnwrap().aggregateId).toBeDefined();
  });
});
