import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { ReconstituteDocumentAggregatePayloadBuilder } from '../__test-utils__/reconstitute-document-aggregate-payload.builder';
import { UpdateDocumentContentCommandPayloadBuilder } from '../__test-utils__/update-document-content-command-payload.builder';
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
            getById: jest.fn(() => ok()),
          },
        },
      ],
    }).compile();
    eventPublisher = mod.get(EventPublisher);
    repository = mod.get(DocumentRepository);
    commandHandler = mod.get(UpdateDocumentContentCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store updated document', async () => {
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(
        ok(
          DocumentAggregate.reconstitute(
            aReconstituteDocumentAggregatePayload().withId('1').build(),
          ),
        ),
      );
    const commandPayload = anUpdateDocumentContentCommandPayload()
      .withDocumentId('1')
      .withContent('new')
      .build();
    await commandHandler.execute(
      new UpdateDocumentContentCommand(commandPayload),
    );

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', content: 'new' }),
    );
  });

  it('should update document content', async () => {
    const documentAggregate = DocumentAggregate.reconstitute(
      aReconstituteDocumentAggregatePayload().withId('1').build(),
    );
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(ok(documentAggregate));
    const updateContentSpy = jest.spyOn(documentAggregate, 'updateContent');
    const commandPayload = anUpdateDocumentContentCommandPayload()
      .withDocumentId('1')
      .withContent('new')
      .build();

    await commandHandler.execute(
      new UpdateDocumentContentCommand(commandPayload),
    );

    expect(updateContentSpy).toHaveBeenCalledWith('new');
  });

  it('should emit aggregate events', async () => {
    const documentAggregate = DocumentAggregate.reconstitute(
      aReconstituteDocumentAggregatePayload().withId('1').build(),
    );
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(documentAggregate);
    const commitSpy = jest.spyOn(documentAggregate, 'commit');

    await commandHandler.execute(
      new UpdateDocumentContentCommand(
        anUpdateDocumentContentCommandPayload().build(),
      ),
    );

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });

  it('should fail with get document error', async () => {
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(err(new DocumentNotFoundError('1')));

    const result = await commandHandler.execute(
      new UpdateDocumentContentCommand(
        anUpdateDocumentContentCommandPayload().build(),
      ),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({ constructor: DocumentNotFoundError }),
    );
  });

  it('should fail with update content error', async () => {
    const documentAggregate = DocumentAggregate.reconstitute(
      aReconstituteDocumentAggregatePayload().withId('1').build(),
    );
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(documentAggregate);
    jest
      .spyOn(documentAggregate, 'updateContent')
      .mockReturnValueOnce(err(new DocumentTooOldForContentUpdateError('1')));

    const result = await commandHandler.execute(
      new UpdateDocumentContentCommand(
        anUpdateDocumentContentCommandPayload().build(),
      ),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({
        constructor: DocumentTooOldForContentUpdateError,
      }),
    );
  });
});

const aReconstituteDocumentAggregatePayload = () =>
  new ReconstituteDocumentAggregatePayloadBuilder();

const anUpdateDocumentContentCommandPayload = () =>
  new UpdateDocumentContentCommandPayloadBuilder();
