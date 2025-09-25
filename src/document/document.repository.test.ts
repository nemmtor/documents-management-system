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
            find: jest.fn(),
            insertOrUpdate: jest.fn(),
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

  describe('getOneById', () => {
    it('should query db with correct id', async () => {
      const documentId = 'test-id';
      const mockDbDocument = {
        id: documentId,
        content: 'test content',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      };
      const findSpy = jest
        .spyOn(db, 'find')
        .mockResolvedValueOnce(mockDbDocument);

      await repository.getOneById(documentId);

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(documentId);
    });

    it('should fail with DocumentNotFoundError when document not found', async () => {
      const documentId = 'non-existent-id';
      jest.spyOn(db, 'find').mockResolvedValueOnce(undefined);

      const result = await repository.getOneById(documentId);

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: DocumentNotFoundError,
        }),
      );
    });

    it('should return DocumentAggregate when document is found', async () => {
      const documentId = 'existing-id';
      const mockDbDocument = {
        id: documentId,
        content: 'existing content',
        createdAt: '2023-05-01T10:30:00Z',
        updatedAt: '2023-05-02T15:45:00Z',
      };
      jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbDocument);

      const result = await repository.getOneById(documentId);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate).toBeInstanceOf(DocumentAggregate);
      expect(documentAggregate.id).toBe(documentId);
      expect(documentAggregate.content).toBe('existing content');
      expect(documentAggregate.createdAt).toEqual(
        new Date('2023-05-01T10:30:00Z'),
      );
    });

    it('should correctly map to entity', async () => {
      const documentId = 'date-test';
      const isoString = '2023-03-15T08:30:00.000Z';
      const mockDbDocument = {
        id: documentId,
        content: 'content',
        createdAt: isoString,
        updatedAt: '2023-03-16T08:30:00.000Z',
      };
      jest.spyOn(db, 'find').mockResolvedValueOnce(mockDbDocument);

      const result = await repository.getOneById(documentId);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate.createdAt).toBeInstanceOf(Date);
      expect(documentAggregate.createdAt.toISOString()).toBe(isoString);
    });
  });

  describe('persist', () => {
    it('should persist correct data in db', async () => {
      const documentAggregate = new DocumentAggregate({
        id: 'persist-test',
        content: 'content to persist',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
      const insertOrUpdateSpy = jest
        .spyOn(db, 'insertOrUpdate')
        .mockResolvedValueOnce(undefined);

      await repository.persist(documentAggregate);

      expect(insertOrUpdateSpy).toHaveBeenCalledTimes(1);
      expect(insertOrUpdateSpy).toHaveBeenCalledWith({
        id: 'persist-test',
        content: 'content to persist',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
      });
    });

    it('should bump updatedAt before persisting', async () => {
      const documentAggregate = new DocumentAggregate({
        id: 'timestamp-test',
        content: 'content',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
      const insertOrUpdateSpy = jest
        .spyOn(db, 'insertOrUpdate')
        .mockResolvedValueOnce(undefined);
      const beforePersist = new Date();

      await repository.persist(documentAggregate);

      const afterPersist = new Date();
      const calledWith = insertOrUpdateSpy.mock.calls[0][0];
      const updatedAtDate = new Date(calledWith.updatedAt);

      expect(updatedAtDate.getTime()).toBeGreaterThanOrEqual(
        beforePersist.getTime(),
      );
      expect(updatedAtDate.getTime()).toBeLessThanOrEqual(
        afterPersist.getTime(),
      );
    });
  });
});
