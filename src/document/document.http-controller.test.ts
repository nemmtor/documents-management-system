import { BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { err, ok } from 'neverthrow';
import { AssertNeverError } from '../shared/assert-never';
import { CreateDocumentCommandResultBuilder } from './__test-utils__/create-document-command-result.builder';
import { CreateDocumentRequestDTOBuilder } from './__test-utils__/create-document-request-dto.builder';
import { DocumentReadModelBuilder } from './__test-utils__/document-read-model.builder';
import { UpdateDocumentContentParamsDTOBuilder } from './__test-utils__/update-document-content-params-dto.builder';
import { UpdateDocumentContentRequestDTOBuilder } from './__test-utils__/update-document-content-request-dto.builder';
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
    it('should return document when found', async () => {
      const documentReadModel = aDocumentReadModel().withId('1').build();
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(documentReadModel);

      const result = await controller.findOne({ documentId: '1' });

      expect(result).toEqual(documentReadModel);
    });

    it('should execute GetDocumentQuery with correct payload', async () => {
      const documentReadModel = aDocumentReadModel().withId('1').build();
      const executeSpy = jest
        .spyOn(queryBus, 'execute')
        .mockResolvedValueOnce(documentReadModel);

      await controller.findOne({ documentId: '1' });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: GetDocumentQuery,
          payload: { documentId: '1' },
        }),
      );
    });

    it('should throw DocumentNotFoundHttpError when document is not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(undefined);

      await expect(controller.findOne({ documentId: '1' })).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });
  });

  describe('create', () => {
    it('should return correct response', async () => {
      const dto = aCreateDocumentRequestDTO().build();
      const commandResult = aCreateDocumentCommandResult()
        .withDocumentId('1')
        .build();
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(commandResult);

      const result = await controller.create(dto);

      expect(result).toEqual({ documentId: '1' });
    });

    it('should execute CreateDocumentCommand with correct payload', async () => {
      const dto = aCreateDocumentRequestDTO().withContent('content').build();
      const response = aCreateDocumentCommandResult().build();
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(response);

      await controller.create(dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: CreateDocumentCommand,
          payload: { content: 'content' },
        }),
      );
    });
  });

  describe('updateContent', () => {
    it('should complete successfully', async () => {
      const params = aUpdateDocumentContentParamsDTO().build();
      const dto = aUpdateDocumentContentRequestDTO().build();
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(ok());

      await expect(
        controller.updateContent(params, dto),
      ).resolves.toBeUndefined();
    });

    it('should execute UpdateDocumentContentCommand with correct payload', async () => {
      const params = aUpdateDocumentContentParamsDTO()
        .withDocumentId('1')
        .build();
      const dto = aUpdateDocumentContentRequestDTO()
        .withContent('content')
        .build();
      const executeSpy = jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(ok());

      await controller.updateContent(params, dto);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: UpdateDocumentContentCommand,
          payload: {
            content: 'content',
            documentId: '1',
          },
        }),
      );
    });

    it('should throw DocumentNotFoundHttpError if document was not found', async () => {
      const params = aUpdateDocumentContentParamsDTO()
        .withDocumentId('1')
        .build();
      const dto = aUpdateDocumentContentRequestDTO().build();
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new DocumentNotFoundError('1')));

      await expect(controller.updateContent(params, dto)).rejects.toThrow(
        DocumentNotFoundHttpError,
      );
    });

    it('should throw BadRequestException if document was too old for content update', async () => {
      const params = aUpdateDocumentContentParamsDTO()
        .withDocumentId('1')
        .build();
      const dto = aUpdateDocumentContentRequestDTO().build();
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(
          err(new DocumentTooOldForContentUpdateError('1')),
        );

      const promise = controller.updateContent(params, dto);

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(
        'Document too old for content update',
      );
    });

    it('should throw assertion error on unexpected error', async () => {
      const params = aUpdateDocumentContentParamsDTO()
        .withDocumentId('1')
        .build();
      const dto = aUpdateDocumentContentRequestDTO().build();
      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(err(new Error('Some other error')));

      const promise = controller.updateContent(params, dto);

      await expect(promise).rejects.toThrow(AssertNeverError);
      await expect(promise).rejects.toThrow('Unexpected error type');
    });
  });
});

const aDocumentReadModel = () => new DocumentReadModelBuilder();
const aCreateDocumentRequestDTO = () => new CreateDocumentRequestDTOBuilder();
const aCreateDocumentCommandResult = () =>
  new CreateDocumentCommandResultBuilder();
const aUpdateDocumentContentRequestDTO = () =>
  new UpdateDocumentContentRequestDTOBuilder();
const aUpdateDocumentContentParamsDTO = () =>
  new UpdateDocumentContentParamsDTOBuilder();
