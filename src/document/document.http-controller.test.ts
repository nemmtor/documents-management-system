import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateDocumentCommand } from './commands/create-document.command';
import { UpdateDocumentContentCommand } from './commands/update-document-content.command';
import { DocumentHttpController } from './document.http-controller';
import { DocumentNotFoundError } from './errors/document-not-found.error';
import { DocumentNotFoundHttpError } from './errors/document-not-found.http-error';
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
        .mockResolvedValue(mockDocument);

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
      jest.spyOn(queryBus, 'execute').mockResolvedValue(undefined);

      await expect(controller.findOne(documentId)).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });

    it('should return document when found', async () => {
      const documentId = '1';
      const mockDocument = { id: documentId, content: 'content' };
      jest.spyOn(queryBus, 'execute').mockResolvedValue(mockDocument);

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
        .mockResolvedValue(mockResponse);

      await controller.create(dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: CreateDocumentCommand,
          payload: { content: dto.content },
        }),
      );
    });

    it('should return documentId from aggregateId', async () => {
      const dto = { content: 'content' };
      const mockResponse = { aggregateId: '1' };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(mockResponse);

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
        .mockResolvedValue(undefined);

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

    it('should translate DocumentNotFoundError to DocumentNotFoundHttpError', async () => {
      const documentId = 'non-existent-doc';
      const dto = { content: 'updated content' };
      const domainError = new DocumentNotFoundError(documentId);
      jest.spyOn(commandBus, 'execute').mockRejectedValue(domainError);

      await expect(controller.updateContent(documentId, dto)).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });

    it('should re-throw other errors without translation', async () => {
      const documentId = '1';
      const dto = { content: 'content' };
      const genericError = new Error('Some other error');
      jest.spyOn(commandBus, 'execute').mockRejectedValue(genericError);

      await expect(controller.updateContent(documentId, dto)).rejects.toThrow(
        'Some other error',
      );
    });

    it('should complete successfully when command executes without error', async () => {
      const documentId = '1';
      const dto = { content: 'new content' };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      await expect(
        controller.updateContent(documentId, dto),
      ).resolves.toBeUndefined();
    });
  });
});
