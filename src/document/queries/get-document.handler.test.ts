import { Test, TestingModule } from '@nestjs/testing';
import { DocumentReadModelBuilder } from '../__test-utils__/document-read-model.builder';
import { DocumentReadPersistanceModelBuilder } from '../__test-utils__/document-read-persistance-model.builder';
import { GetDocumentQueryPayloadBuilder } from '../__test-utils__/get-document-query-payload.builder';
import { DocumentReadDbClient } from '../document-read.db-client';
import { GetDocumentQueryHandler } from './get-document.handler';
import { GetDocumentQuery } from './get-document.query';

describe('GetDocumentQueryHandler', () => {
  let handler: GetDocumentQueryHandler;
  let readDb: DocumentReadDbClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDocumentQueryHandler,
        {
          provide: DocumentReadDbClient,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetDocumentQueryHandler>(GetDocumentQueryHandler);
    readDb = module.get<DocumentReadDbClient>(DocumentReadDbClient);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return DocumentReadModel', async () => {
    const persistedDocument = aPersistedDocument()
      .withId('1')
      .withContent('content')
      .withCreatedAt(new Date())
      .withUpdatedAt(new Date())
      .build();
    const readModel = aDocumentReadModel()
      .withId('1')
      .withContent('content')
      .withCreatedAt(new Date().toISOString())
      .withUpdatedAt(new Date().toISOString())
      .build();
    const queryPayload = aGetDocumentQueryPayload().withDocumentId('1').build();

    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(persistedDocument);

    const result = await handler.execute(new GetDocumentQuery(queryPayload));

    expect(result).toEqual(readModel);
  });

  it('should return only required fields', async () => {
    const persistedDocument = aPersistedDocument().withId('1').build();
    const wrongDocument = {
      ...persistedDocument,
      extraField1: 'should not appear',
      extraField2: 42,
      extraField3: { nested: 'object' },
    };
    const queryPayload = aGetDocumentQueryPayload().withDocumentId('1').build();
    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(wrongDocument);

    const result = await handler.execute(new GetDocumentQuery(queryPayload));

    expect(result).not.toHaveProperty('extraField1');
    expect(result).not.toHaveProperty('extraField2');
    expect(result).not.toHaveProperty('extraField3');
  });

  it('should call db.find with document id', async () => {
    const findSpy = jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(null);
    const queryPayload = aGetDocumentQueryPayload().withDocumentId('1').build();

    await handler.execute(new GetDocumentQuery(queryPayload));

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith({ _id: '1' });
  });

  it('should return undefined when document is not found', async () => {
    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(null);
    const queryPayload = aGetDocumentQueryPayload().withDocumentId('1').build();

    const result = await handler.execute(new GetDocumentQuery(queryPayload));

    expect(result).toBeUndefined();
  });
});

const aPersistedDocument = () => new DocumentReadPersistanceModelBuilder();
const aDocumentReadModel = () => new DocumentReadModelBuilder();
const aGetDocumentQueryPayload = () => new GetDocumentQueryPayloadBuilder();
