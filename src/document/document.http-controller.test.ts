import { BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { CreateDocumentCommand } from './commands/create-document.command';
import { UpdateDocumentContentCommand } from './commands/update-document-content.command';
import { DocumentHttpController } from './document.http-controller';
import { DocumentNotFoundError } from './errors/document-not-found.error';
import { DocumentNotFoundHttpError } from './errors/document-not-found.http-error';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { GetDocumentQuery } from './queries/get-document.query';

describe('DocumentHttpController', () => {
  let controller: DocumentHttpController;
  let queryBus: QueryBus;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentHttpController],
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

    controller = module.get<DocumentHttpController>(DocumentHttpController);
    queryBus = module.get<QueryBus>(QueryBus);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should execute GetDocumentQuery with correct parameters', async () => {
      const documentId = '1';
      const mockDocument = { id: documentId, content: 'test content' };
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValueOnce(mockDocument);

      await controller.findOne(documentId);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: GetDocumentQuery,
          payload: { documentId },
        }),
      );
    });

    it('should throw DocumentNotFoundHttpError when document is not found', async () => {
      const documentId = '1';
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(undefined);

      await expect(controller.findOne(documentId)).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });

    it('should return document when found', async () => {
      const documentId = '1';
      const mockDocument = { id: documentId, content: 'content' };
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockDocument);

      const result = await controller.findOne(documentId);

      expect(result).toEqual(mockDocument);
    });
  });

  describe('create', () => {
    it('should execute CreateDocumentCommand with correct parameters', async () => {
      const dto = { content: 'new document content' };
      const mockResponse = { aggregateId: '1' };
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(mockResponse);

      await controller.create(dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: CreateDocumentCommand,
          payload: { content: dto.content },
        }),
      );
    });

    it('should return created document id', async () => {
      const dto = { content: 'content' };
      const mockResponse = { aggregateId: '1' };
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockResponse);

      const result = await controller.create(dto);

      expect(result).toEqual({ documentId: '1' });
    });
  });

  describe('updateContent', () => {
    it('should execute UpdateDocumentContentCommand with correct parameters', async () => {
      const documentId = '1';
      const dto = { content: 'updated content' };
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(ok());

      await controller.updateContent(documentId, dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: UpdateDocumentContentCommand,
          payload: {
            content: dto.content,
            documentId: documentId,
          },
        }),
      );
    });

    it('should throw DocumentNotFoundHttpError if document was not found', async () => {
      const documentId = 'non-existent-doc';
      const dto = { content: 'updated content' };
      const domainError = new DocumentNotFoundError(documentId);
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(err(domainError));

      await expect(controller.updateContent(documentId, dto)).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });

    it('should throw BadRequestException if document was too old for content update', async () => {
      const documentId = 'non-existent-doc';
      const dto = { content: 'updated content' };
      const domainError = new DocumentTooOldForContentUpdateError(documentId);
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(err(domainError));

      await expect(controller.updateContent(documentId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw other on unexpected error', async () => {
      const documentId = '1';
      const dto = { content: 'content' };
      const genericError = new Error('Some other error');
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(genericError));

      await expect(controller.updateContent(documentId, dto)).rejects.toThrow(
        'Unexpected error type',
      );
    });

    it('should complete successfully when command executes without error', async () => {
      const documentId = '1';
      const dto = { content: 'new content' };
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(ok());

      await expect(
        controller.updateContent(documentId, dto),
      ).resolves.toBeUndefined();
    });
  });
});
