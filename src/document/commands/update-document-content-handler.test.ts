import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { DocumentAggregate } from '../document.aggregate';
import { DocumentRepository } from '../document.repository';
import { DocumentNotFoundError } from '../errors/document-not-found.error';
import { DocumentTooOldForContentUpdateError } from '../errors/document-too-old-for-content-update.error';
import { UpdateDocumentContentCommand } from './update-document-content.command';
import { UpdateDocumentContentCommandHandler } from './update-document-content.handler';

describe('UpdateDocumentContentCommandHandler', () => {
  let commandHandler: UpdateDocumentContentCommandHandler;
  let repository: DocumentRepository;
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
    repository = mod.get(DocumentRepository);
    commandHandler = mod.get(UpdateDocumentContentCommandHandler);
  });

  it('should store updated document', async () => {
    jest.spyOn(repository, 'getOneById').mockResolvedValueOnce(
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

    expect(repository.persist).toHaveBeenCalledWith(
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
      .spyOn(repository, 'getOneById')
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

  it('should fail with get document error', async () => {
    jest
      .spyOn(repository, 'getOneById')
      .mockResolvedValueOnce(err(new DocumentNotFoundError('1')));

    const result = await commandHandler.execute(
      new UpdateDocumentContentCommand({
        documentId: '1',
        content: 'Hello world',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({ constructor: DocumentNotFoundError }),
    );
  });

  it('should fail with update content error', async () => {
    const documentAggregate = new DocumentAggregate({
      id: '1',
      content: 'hi',
      createdAt: new Date(),
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(documentAggregate);
    jest
      .spyOn(documentAggregate, 'updateContent')
      .mockReturnValueOnce(
        err(new DocumentTooOldForContentUpdateError(documentAggregate.id)),
      );

    const result = await commandHandler.execute(
      new UpdateDocumentContentCommand({
        documentId: '1',
        content: 'Hello world',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({
        constructor: DocumentTooOldForContentUpdateError,
      }),
    );
  });
});
