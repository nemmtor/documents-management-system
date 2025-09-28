import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { Attachment } from '../attachment.vo';
import { ContractAggregate } from '../contract.aggregate';
import { ContractRepository } from '../contract.repository';
import { CannotUnseeAttachmentOfSignedContract } from '../errors/cannot-unsee-attachment-of-signed-contract.error';
import { ContractNotFoundError } from '../errors/contract-not-found.error';
import { UnseeAttachmentCommand } from './unsee-attachment.command';
import { UnseeAttachmentCommandHandler } from './unsee-attachment.handler';

describe('UnseeAttachmentCommandHandler', () => {
  let commandHandler: UnseeAttachmentCommandHandler;
  let repository: ContractRepository;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        UnseeAttachmentCommandHandler,
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
    commandHandler = mod.get(UnseeAttachmentCommandHandler);
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
          attachments: [new Attachment({ id: '1', isSeen: true })],
        }),
      ),
    );

    await commandHandler.execute(
      new UnseeAttachmentCommand({ attachmentId: '1', contractId: '1' }),
    );

    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ constructor: Attachment })],
      }),
    );
    expect(repository.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [expect.objectContaining({ id: '1', isSeen: false })],
      }),
    );
  });

  it('should unsee attachment', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: false,
      attachments: [new Attachment({ id: '1', isSeen: true })],
    });
    jest
      .spyOn(repository, 'getById')
      .mockResolvedValueOnce(ok(contractAggregate));
    const unseeAttachmentSpy = jest.spyOn(contractAggregate, 'unseeAttachment');

    await commandHandler.execute(
      new UnseeAttachmentCommand({ contractId: '1', attachmentId: '1' }),
    );

    expect(unseeAttachmentSpy).toHaveBeenCalledWith('1');
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
      new UnseeAttachmentCommand({
        attachmentId: '1',
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
      new UnseeAttachmentCommand({
        attachmentId: '1',
        contractId: '1',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({ constructor: ContractNotFoundError }),
    );
  });

  it('should fail with unsee attachment error', async () => {
    const contractAggregate = new ContractAggregate({
      id: '1',
      createdAt: new Date(),
      isSigned: true,
      attachments: [new Attachment({ id: '1', isSeen: true })],
    });
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockReturnValueOnce(contractAggregate);
    jest
      .spyOn(contractAggregate, 'unseeAttachment')
      .mockReturnValueOnce(
        err(new CannotUnseeAttachmentOfSignedContract(contractAggregate.id)),
      );

    const result = await commandHandler.execute(
      new UnseeAttachmentCommand({
        attachmentId: '1',
        contractId: '1',
      }),
    );

    expect(result._unsafeUnwrapErr()).toEqual(
      expect.objectContaining({
        constructor: CannotUnseeAttachmentOfSignedContract,
      }),
    );
  });
});
