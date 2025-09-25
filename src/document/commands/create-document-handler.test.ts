import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
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
    await commandHandler.execute(
      new CreateDocumentCommand({ content: 'Hello world' }),
    );

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'Hello world' }),
    );
  });

  it('should return aggregate id', async () => {
    const result = await commandHandler.execute(
      new CreateDocumentCommand({ content: 'Hello world' }),
    );

    expect(result.aggregateId).toBeDefined();
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
      new CreateDocumentCommand({ content: 'Hello world' }),
    );

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });
});
