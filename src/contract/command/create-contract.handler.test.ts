import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ContractAggregate } from '../contract.aggregate';
import { ContractRepository } from '../contract.repository';
import { CreateContractCommand } from './create-contract.command';
import { CreateContractCommandHandler } from './create-contract.handler';

describe('CreateContractCommandHandler', () => {
  let commandHandler: CreateContractCommandHandler;
  let repository: ContractRepository;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateContractCommandHandler,
        {
          provide: ContractRepository,
          useValue: {
            persist: jest.fn(),
          },
        },
      ],
    }).compile();
    eventPublisher = mod.get(EventPublisher);
    repository = mod.get(ContractRepository);
    commandHandler = mod.get(CreateContractCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store created contract', async () => {
    await commandHandler.execute(
      new CreateContractCommand({ attachmentIds: ['1'] }),
    );

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: [{ id: '1', isSeen: false }] }),
    );
  });

  it('should return aggregate id', async () => {
    const result = await commandHandler.execute(
      new CreateContractCommand({ attachmentIds: ['1'] }),
    );

    expect(result.aggregateId).toBeDefined();
  });

  it('should emit aggregate events', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: false,
      attachments: [],
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(contractAggregate);
    const commitSpy = jest.spyOn(contractAggregate, 'commit');

    await commandHandler.execute(
      new CreateContractCommand({ attachmentIds: [] }),
    );

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });
});
