import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CreateDocumentAggregatePayloadBuilder } from '../__test-utils__/create-document-aggregate-payload.builder';
import { CreateDocumentCommandPayloadBuilder } from '../__test-utils__/create-document-command-payload.builder';
import { DocumentAggregate } from '../document.aggregate';
import { DocumentRepository } from '../document.repository';
import { CreateDocumentCommand } from './create-document.command';
import { CreateDocumentCommandHandler } from './create-document.handler';

describe('CreateDocumentCommandHandler', () => {
  let commandHandler: CreateDocumentCommandHandler;
  let repository: DocumentRepository;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateDocumentCommandHandler,
        {
          provide: DocumentRepository,
          useValue: {
            persist: jest.fn(),
          },
        },
      ],
    }).compile();
    eventPublisher = mod.get(EventPublisher);
    repository = mod.get(DocumentRepository);
    commandHandler = mod.get(CreateDocumentCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store created document', async () => {
    const commandPayload = aCreateDocumentPayload()
      .withContent('content')
      .build();
    await commandHandler.execute(new CreateDocumentCommand(commandPayload));

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'content' }),
    );
  });

  it('should return aggregate id', async () => {
    const commandPayload = aCreateDocumentPayload().build();
    const result = await commandHandler.execute(
      new CreateDocumentCommand(commandPayload),
    );

    expect(result.documentId).toBeDefined();
  });

  it('should emit aggregate events', async () => {
    const commandPayload = aCreateDocumentPayload().build();
    const documentAggregate = DocumentAggregate.create(
      aCreateDocumentAggregatePayload().build(),
    );
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(documentAggregate);
    const commitSpy = jest.spyOn(documentAggregate, 'commit');

    await commandHandler.execute(new CreateDocumentCommand(commandPayload));

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });
});

const aCreateDocumentPayload = () => new CreateDocumentCommandPayloadBuilder();
const aCreateDocumentAggregatePayload = () =>
  new CreateDocumentAggregatePayloadBuilder();
