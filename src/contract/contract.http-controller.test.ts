import { BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { AssertNeverError } from '../shared/assert-never';
import { CreateContractCommand } from './command/create-contract.command';
import { SeeAttachmentCommand } from './command/see-attachment.command';
import { SignContractCommand } from './command/sign-contract.command';
import { ContractHttpController } from './contract.http-controller';
import { AttachmentNotFoundError } from './errors/attachment-not-found.error';
import { AttachmentNotFoundHttpError } from './errors/attachment-not-found.http-error';
import { CannotSignContractWithUnseenAttachmentsError } from './errors/cannot-sign-contract-with-unseen-attachments.error';
import { ContractNotFoundError } from './errors/contract-not-found.error';
import { ContractNotFoundHttpError } from './errors/contract-not-found.http-error';
import { GetAllContractsQuery } from './queries/get-all-contracts.query';
import { GetContractQuery } from './queries/get-contract.query';

describe('ContractHttpController', () => {
  let controller: ContractHttpController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractHttpController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
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

    controller = module.get<ContractHttpController>(ContractHttpController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return contracts when found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([{ id: '1' }]);

      const result = await controller.findAll();

      expect(result).toEqual([{ id: '1' }]);
    });

    it('should return empty list if there are no contracts', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should execute GetAllContractQuery', async () => {
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValueOnce([]);

      await controller.findAll();

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: GetAllContractsQuery,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return contract when found', async () => {
      const contractId = '1';
      const mockContract = { id: contractId };
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockContract);

      const result = await controller.findOne(contractId);

      expect(result).toEqual(mockContract);
    });

    it('should execute GetContractQuery with correct payload', async () => {
      const contractId = '1';
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValueOnce({ id: contractId });

      await controller.findOne(contractId);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: GetContractQuery,
          payload: { contractId },
        }),
      );
    });

    it('should throw ContractNotFoundHttpError when contract is not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(undefined);

      await expect(controller.findOne('1')).rejects.toThrow(
        ContractNotFoundHttpError,
      );
    });
  });

  describe('create', () => {
    it('should return created contract id', async () => {
      const dto = { attachmentIds: ['1'] };
      const mockResponse = { aggregateId: '1' };
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockResponse);

      const result = await controller.create(dto);

      expect(result).toEqual({ contractId: '1' });
    });

    it('should execute CreateContractCommand with correct payload', async () => {
      const dto = { attachmentIds: ['1'] };
      const mockResponse = { aggregateId: '1' };
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(mockResponse);

      await controller.create(dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: CreateContractCommand,
          payload: { attachmentIds: dto.attachmentIds },
        }),
      );
    });
  });

  describe('see attachment', () => {
    it('should complete successfully', async () => {
      const attachmentId = '2';
      const contractId = '1';
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(ok());

      await expect(
        controller.seeAttachment(contractId, attachmentId),
      ).resolves.toBeUndefined();
    });

    it('should execute SeeAttachmentCommand with correct payload', async () => {
      const attachmentId = '2';
      const contractId = '1';
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(ok());

      await controller.seeAttachment(contractId, attachmentId);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: SeeAttachmentCommand,
          payload: { attachmentId, contractId },
        }),
      );
    });

    it('should throw ContractNotFoundHttpError if contract was not found', async () => {
      const attachmentId = '2';
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new ContractNotFoundError(contractId)));

      await expect(
        controller.seeAttachment(contractId, attachmentId),
      ).rejects.toThrow(ContractNotFoundHttpError);
    });

    it('should throw AttachmentNotFoundHttpError if attachment was not found', async () => {
      const attachmentId = '2';
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(
          err(new AttachmentNotFoundError({ attachmentId, contractId })),
        );

      await expect(
        controller.seeAttachment(contractId, attachmentId),
      ).rejects.toThrow(AttachmentNotFoundHttpError);
    });

    it('should throw assertion error on unexpected error', async () => {
      const attachmentId = '2';
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new Error('Unexpected error')));

      await expect(
        controller.seeAttachment(contractId, attachmentId),
      ).rejects.toThrow(AssertNeverError);
    });
  });

  describe('sign contract', () => {
    it('should complete successfully', async () => {
      const contractId = '1';
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(ok());

      await expect(controller.sign(contractId)).resolves.toBeUndefined();
    });

    it('should execute SignContractCommand with correct payload', async () => {
      const contractId = '1';
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(ok());

      await controller.sign(contractId);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: SignContractCommand,
          payload: { contractId },
        }),
      );
    });

    it('should throw ContractNotFoundHttpError if contract was not found', async () => {
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new ContractNotFoundError(contractId)));

      await expect(controller.sign(contractId)).rejects.toThrow(
        ContractNotFoundHttpError,
      );
    });

    it('should throw BadRequestException if contract has unseen attachments', async () => {
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(
          err(new CannotSignContractWithUnseenAttachmentsError(contractId)),
        );

      await expect(controller.sign(contractId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw unexpected error on unexpected error', async () => {
      const contractId = '1';
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new Error('Unexpected error')));

      await expect(controller.sign(contractId)).rejects.toThrow(
        AssertNeverError,
      );
    });
  });
});
