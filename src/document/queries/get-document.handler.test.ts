import { Test, TestingModule } from '@nestjs/testing';
import { DocumentReadDbClient } from '../document-read.db-client';
import { GetDocumentQueryHandler } from './get-document.handler';
import { GetDocumentQuery } from './get-document.query';

// TODO: double check tests
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
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return DocumentReadModel', async () => {
    const mockDbDocument = {
      _id: '1',
      content: 'test content',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: mockDbDocument._id }),
    );

    expect(result).toEqual({
      id: '1',
      content: 'test content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('should return only required fields', async () => {
    const mockDbDocument = {
      _id: '1',
      content: 'content',
      createdAt: new Date(),
      updatedAt: new Date(),
      extraField1: 'should not appear',
      extraField2: 42,
      extraField3: { nested: 'object' },
    };
    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(mockDbDocument);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: mockDbDocument._id }),
    );

    expect(result).not.toHaveProperty('extraField1');
    expect(result).not.toHaveProperty('extraField2');
    expect(result).not.toHaveProperty('extraField3');
  });

  it('should call db.find with document id', async () => {
    const documentId = '1';
    const findSpy = jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(null);

    await handler.execute(new GetDocumentQuery({ documentId }));

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith({ _id: documentId });
  });

  it('should return undefined when document is not found', async () => {
    jest.spyOn(readDb, 'findOne').mockResolvedValueOnce(null);

    const result = await handler.execute(
      new GetDocumentQuery({ documentId: '1' }),
    );

    expect(result).toBeUndefined();
  });
});
