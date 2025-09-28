import { Test, TestingModule } from '@nestjs/testing';
import { DocumentAggregate } from './document.aggregate';
import { DocumentDb } from './document.db';
import { DocumentRepository } from './document.repository';
import { DocumentNotFoundError } from './errors/document-not-found.error';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let db: DocumentDb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepository,
        {
          provide: DocumentDb,
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<DocumentRepository>(DocumentRepository);
    db = module.get<DocumentDb>(DocumentDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return DocumentAggregate when document is found', async () => {
      const mockDbDocument = {
        _id: '1',
        content: 'existing content',
        createdAt: '2023-05-01T10:30:00Z',
        updatedAt: '2023-05-02T15:45:00Z',
      };
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(mockDbDocument);

      const result = await repository.getById(mockDbDocument._id);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate).toBeInstanceOf(DocumentAggregate);
      expect(documentAggregate.id).toBe(mockDbDocument._id);
    });

    it('should correctly map to entity', async () => {
      const mockDbDocument = {
        _id: '1',
        content: 'content',
        createdAt: '2023-03-15T08:30:00.000Z',
        updatedAt: '2023-03-16T08:30:00.000Z',
      };
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(mockDbDocument);

      const result = await repository.getById(mockDbDocument._id);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate.id).toBe(mockDbDocument._id);
      expect(documentAggregate.content).toBe(mockDbDocument.content);
      expect(documentAggregate.createdAt).toBeInstanceOf(Date);
      expect(documentAggregate.createdAt.toISOString()).toBe(
        mockDbDocument.createdAt,
      );
    });

    it('should query db with correct id', async () => {
      const mockDbDocument = {
        _id: '1',
        content: 'test content',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      };
      const findSpy = jest
        .spyOn(db, 'findOne')
        .mockResolvedValueOnce(mockDbDocument);

      await repository.getById(mockDbDocument._id);

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith({ _id: mockDbDocument._id });
    });

    it('should fail with DocumentNotFoundError when document not found', async () => {
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.getById('1');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: DocumentNotFoundError,
        }),
      );
    });
  });

  describe('persist', () => {
    it('should persist correct data in db', async () => {
      const documentAggregate = new DocumentAggregate({
        id: '1',
        content: 'content to persist',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
      const updateSpy = jest.spyOn(db, 'updateOne');

      await repository.persist(documentAggregate);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(
        {
          _id: documentAggregate.id,
        },
        {
          $set: {
            _id: documentAggregate.id,
            content: documentAggregate.content,
            createdAt: documentAggregate.createdAt.toISOString(),
            updatedAt: expect.any(String),
          },
        },
        { upsert: true },
      );
    });

    it.todo('should bump updatedAt before persisting');
  });
});
