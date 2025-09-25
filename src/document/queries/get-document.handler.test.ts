import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDb } from '../document.db';
import { GetDocumentQueryHandler } from './get-document.handler';
import { GetDocumentQuery } from './get-document.query';

describe('GetDocumentQueryHandler', () => {
  let handler: GetDocumentQueryHandler;
  let documentDb: DocumentDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDocumentQueryHandler,
        {
          provide: DocumentDb,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetDocumentQueryHandler>(GetDocumentQueryHandler);
    documentDb = module.get<DocumentDb>(DocumentDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call documentDb.find with correct documentId', async () => {
    const documentId = 'test-doc-id';
    const query = new GetDocumentQuery({ documentId });
    const findSpy = jest
      .spyOn(documentDb, 'find')
      .mockResolvedValueOnce(undefined);

    await handler.execute(query);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(documentId);
  });

  it('should return undefined when document is not found', async () => {
    const documentId = 'non-existent-id';
    const query = new GetDocumentQuery({ documentId });
    jest.spyOn(documentDb, 'find').mockResolvedValueOnce(undefined);

    const result = await handler.execute(query);

    expect(result).toBeUndefined();
  });

  it('should return DocumentReadModel when document is found', async () => {
    const documentId = 'existing-doc';
    const query = new GetDocumentQuery({ documentId });
    const mockDbDocument = {
      id: documentId,
      content: 'test content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
      someOtherDbField: 'ignored',
    };
    jest.spyOn(documentDb, 'find').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(query);

    expect(result).toEqual({
      id: documentId,
      content: 'test content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    });
  });

  it('should map only required fields to DocumentReadModel', async () => {
    const documentId = 'mapping-test';
    const query = new GetDocumentQuery({ documentId });
    const mockDbDocument = {
      id: documentId,
      content: 'content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
      extraField1: 'should not appear',
      extraField2: 42,
      extraField3: { nested: 'object' },
    };
    jest.spyOn(documentDb, 'find').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(query);

    expect(result).toEqual({
      id: documentId,
      content: 'content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    });
    expect(result).not.toHaveProperty('extraField1');
    expect(result).not.toHaveProperty('extraField2');
    expect(result).not.toHaveProperty('extraField3');
  });
});
