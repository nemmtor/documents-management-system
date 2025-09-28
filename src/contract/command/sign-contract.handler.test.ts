import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { Attachment } from '../attachment.vo';
import { ContractAggregate } from '../contract.aggregate';
import { ContractRepository } from '../contract.repository';
import { CannotSignContractWithUnseenAttachmentsError } from '../errors/cannot-sign-contract-with-unseen-attachments.error';
import { ContractNotFoundError } from '../errors/contract-not-found.error';
import { SignContractCommand } from './sign-contract.command';
import { SignContractCommandHandler } from './sign-contract.handler';

describe('SignContractCommandHandler', () => {
  let commandHandler: SignContractCommandHandler;
  let repository: ContractRepository;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        SignContractCommandHandler,
        {
          provide: ContractRepository,
          useValue: {
            persist: jest.fn(),
            getById: jest.fn(() => ok()),
          },
        },
      ],
    }).compile();
    eventPublisher = mod.get(EventPublisher);
    repository = mod.get(ContractRepository);
    commandHandler = mod.get(SignContractCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should store updated contract', async () => {
    jest.spyOn(repository, 'getById').mockResolvedValueOnce(
      ok(
        new ContractAggregate({
          id: '1',
          createdAt: new Date(),
          isSigned: false,
          attachments: [],
        }),
      ),
    );

    await commandHandler.execute(new SignContractCommand({ contractId: '1' }));

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({ isSigned: true }),
    );
  });

  it('should sign contract', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: false,
      attachments: [],
    });
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(ok(contractAggregate));
    const signContractSpy = jest.spyOn(contractAggregate, 'sign');

    await commandHandler.execute(new SignContractCommand({ contractId: '1' }));

    expect(signContractSpy).toHaveBeenCalled();
  });

  it('should emit aggregate events', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: false,
      attachments: [new Attachment({ id: '1', isSeen: true })],
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(contractAggregate);
    const commitSpy = jest.spyOn(contractAggregate, 'commit');

    await commandHandler.execute(
      new SignContractCommand({
        contractId: '1',
      }),
    );

    expect(commitSpy).toHaveBeenCalledTimes(1);
  });

  it('should fail with get contract error', async () => {
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(err(new ContractNotFoundError('1')));

    const result = await commandHandler.execute(
      new SignContractCommand({
        contractId: '1',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({ constructor: ContractNotFoundError }),
    );
  });

  it('should fail with sign contract error', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: false,
      attachments: [],
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(contractAggregate);
    jest
      .spyOn(contractAggregate, 'sign')
      .mockReturnValueOnce(
        err(
          new CannotSignContractWithUnseenAttachmentsError(
            contractAggregate.id,
          ),
        ),
      );

    const result = await commandHandler.execute(
      new SignContractCommand({
        contractId: '1',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({
        constructor: CannotSignContractWithUnseenAttachmentsError,
      }),
    );
  });
});
