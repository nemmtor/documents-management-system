import { CommandBus } from '@nestjs/cqrs/dist';
import { Test, TestingModule } from '@nestjs/testing';
import { UnseeAttachmentCommand } from './command/unsee-attachment.command';
import { ContractRepository } from './contract.repository';
import { ContractService } from './contract.service';

describe('ContractService', () => {
  let repository: ContractRepository;
  let commandBus: CommandBus;
  let service: ContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: ContractRepository,
          useValue: {
            findAllUnsignedIds: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ContractRepository>(ContractRepository);
    commandBus = module.get<CommandBus>(CommandBus);
    service = module.get<ContractService>(ContractService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('markAttachmentAsUnseen', () => {
    it('should execute UnseeAttachmentCommand for each unsigned contract', async () => {
      const attachmentId = '1';
      jest.spyOn(repository, 'findAllUnsignedIds').mockResolvedValueOnce([
        {
          id: '1',
          isSigned: false,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          isSigned: false,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      const executeSpy = jest.spyOn(commandBus, 'execute');

      await service.markAttachmentAsUnseen(attachmentId);

      expect(executeSpy).toHaveBeenCalledTimes(2);
      expect(executeSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          constructor: UnseeAttachmentCommand,
          payload: {
            contractId: '1',
            attachmentId,
          },
        }),
      );
      expect(executeSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          constructor: UnseeAttachmentCommand,
          payload: {
            contractId: '2',
            attachmentId,
          },
        }),
      );
    });

    it('should not execute UnseeAttachmentCommand if there is no unsigned contracts', async () => {
      jest.spyOn(repository, 'findAllUnsignedIds').mockResolvedValueOnce([]);
      const executeSpy = jest.spyOn(commandBus, 'execute');

      await service.markAttachmentAsUnseen('1');

      expect(executeSpy).toHaveBeenCalledTimes(0);
    });
  });
});
