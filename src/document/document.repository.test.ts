import { Test, TestingModule } from '@nestjs/testing';
import { DocumentAggregate } from './document.aggregate';
import { DocumentRepository } from './document.repository';
import { DocumentWriteDbClient } from './document-write.db-client';
import { DocumentNotFoundError } from './errors/document-not-found.error';

// TODO: double check tests
describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let db: DocumentWriteDbClient;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepository,
        {
          provide: DocumentWriteDbClient,
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<DocumentRepository>(DocumentRepository);
    db = module.get<DocumentWriteDbClient>(DocumentWriteDbClient);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return DocumentAggregate when document is found', async () => {
      const mockDbDocument = {
        _id: '1',
        content: 'existing content',
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(mockDbDocument);

      const result = await repository.getById(mockDbDocument._id);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate.id).toBe('1');
      expect(documentAggregate.content).toBe('content');
      expect(documentAggregate.createdAt).toEqual(new Date());
      expect(documentAggregate.updatedAt).toEqual(new Date());
    });

    it('should query db with correct id', async () => {
      const mockDbDocument = {
        _id: '1',
        content: 'test content',
        createdAt: new Date(),
        updatedAt: new Date(),
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
      const documentAggregate = DocumentAggregate.reconstitute({
        id: '1',
        content: 'content to persist',
        createdAt: new Date(),
        updatedAt: new Date(),
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
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
    });
  });
});
