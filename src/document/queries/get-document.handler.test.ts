import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDb } from '../document.db';
import { GetDocumentQueryHandler } from './get-document.handler';
import { GetDocumentQuery } from './get-document.query';

describe('GetDocumentQueryHandler', () => {
  let handler: GetDocumentQueryHandler;
  let db: DocumentDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDocumentQueryHandler,
        {
          provide: DocumentDb,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetDocumentQueryHandler>(GetDocumentQueryHandler);
    db = module.get<DocumentDb>(DocumentDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return DocumentReadModel', async () => {
    const mockDbDocument = {
      _id: '1',
      content: 'test content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    };
    jest.spyOn(db, 'findOne').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: mockDbDocument._id }),
    );

    expect(result).toEqual({
      id: mockDbDocument._id,
      content: 'test content',
      createdAt: mockDbDocument.createdAt,
      updatedAt: mockDbDocument.updatedAt,
    });
  });

  it('should return only required fields', async () => {
    const mockDbDocument = {
      _id: '1',
      content: 'content',
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
      extraField1: 'should not appear',
      extraField2: 42,
      extraField3: { nested: 'object' },
    };
    jest.spyOn(db, 'findOne').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: mockDbDocument._id }),
    );

    expect(result).not.toHaveProperty('extraField1');
    expect(result).not.toHaveProperty('extraField2');
    expect(result).not.toHaveProperty('extraField3');
  });

  it('should call db.find with document id', async () => {
    const documentId = '1';
    const findSpy = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null);

    await handler.execute(new GetDocumentQuery({ documentId }));

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith({ _id: documentId });
  });

  it('should return undefined when document is not found', async () => {
    jest.spyOn(db, 'findOne').mockResolvedValueOnce(null);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: '1' }),
    );

    expect(result).toBeUndefined();
  });
});
