import { Test, TestingModule } from '@nestjs/testing';
import { DocumentAggregate } from './document.aggregate';
import { DocumentDb } from './document.db';
import { DocumentRepository } from './document.repository';
import { DocumentNotFoundError } from './errors/document-not-found.error';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let documentDb: DocumentDb;

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
    documentDb = module.get<DocumentDb>(DocumentDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOneById', () => {
    it('should call documentDb.find with correct id', async () => {
      const documentId = 'test-id';
      const mockDbDocument = {
        id: documentId,
        content: 'test content',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      };
      const findSpy = jest
        .spyOn(documentDb, 'find')
        .mockResolvedValue(mockDbDocument);

      await repository.getOneById(documentId);

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith(documentId);
    });

    it('should fail with DocumentNotFoundError when document not found', async () => {
      const documentId = 'non-existent-id';
      jest.spyOn(documentDb, 'find').mockResolvedValue(undefined);

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
      jest.spyOn(documentDb, 'find').mockResolvedValue(mockDbDocument);

      const result = await repository.getOneById(documentId);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate).toBeInstanceOf(DocumentAggregate);
      expect(documentAggregate.id).toBe(documentId);
      expect(documentAggregate.content).toBe('existing content');
      expect(documentAggregate.createdAt).toEqual(
        new Date('2023-05-01T10:30:00Z'),
      );
    });

    it('should convert ISO string to Date object in toEntity mapping', async () => {
      const documentId = 'date-test';
      const isoString = '2023-03-15T08:30:00.000Z';
      const mockDbDocument = {
        id: documentId,
        content: 'content',
        createdAt: isoString,
        updatedAt: '2023-03-16T08:30:00.000Z',
      };
      jest.spyOn(documentDb, 'find').mockResolvedValue(mockDbDocument);

      const result = await repository.getOneById(documentId);
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate.createdAt).toBeInstanceOf(Date);
      expect(documentAggregate.createdAt.toISOString()).toBe(isoString);
    });
  });

  describe('persist', () => {
    it('should call documentDb.insertOrUpdate with correct data', async () => {
      const documentAggregate = new DocumentAggregate({
        id: 'persist-test',
        content: 'content to persist',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
      const insertOrUpdateSpy = jest
        .spyOn(documentDb, 'insertOrUpdate')
        .mockResolvedValue(undefined);

      await repository.persist(documentAggregate);

      expect(insertOrUpdateSpy).toHaveBeenCalledTimes(1);
      expect(insertOrUpdateSpy).toHaveBeenCalledWith({
        id: 'persist-test',
        content: 'content to persist',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: expect.any(String),
      });
    });

    it('should convert Date to ISO string in toPersistance mapping', async () => {
      const createdAt = new Date('2023-06-01T12:00:00Z');
      const documentAggregate = new DocumentAggregate({
        id: 'iso-test',
        content: 'test content',
        createdAt,
      });
      const insertOrUpdateSpy = jest
        .spyOn(documentDb, 'insertOrUpdate')
        .mockResolvedValue(undefined);

      await repository.persist(documentAggregate);

      const calledWith = insertOrUpdateSpy.mock.calls[0][0];
      expect(calledWith.createdAt).toBe('2023-06-01T12:00:00.000Z');
      expect(typeof calledWith.createdAt).toBe('string');
    });

    it('should add current updatedAt timestamp in toPersistance mapping', async () => {
      const documentAggregate = new DocumentAggregate({
        id: 'timestamp-test',
        content: 'content',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
      const insertOrUpdateSpy = jest
        .spyOn(documentDb, 'insertOrUpdate')
        .mockResolvedValue(undefined);
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

    it('should map all required fields for persistence', async () => {
      const documentAggregate = new DocumentAggregate({
        id: 'mapping-test',
        content: 'mapped content',
        createdAt: new Date('2023-07-01T00:00:00Z'),
      });
      const insertOrUpdateSpy = jest
        .spyOn(documentDb, 'insertOrUpdate')
        .mockResolvedValue(undefined);

      await repository.persist(documentAggregate);

      const calledWith = insertOrUpdateSpy.mock.calls[0][0];
      expect(calledWith).toEqual({
        id: 'mapping-test',
        content: 'mapped content',
        createdAt: '2023-07-01T00:00:00.000Z',
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
      });
      expect(Object.keys(calledWith)).toHaveLength(4);
    });
  });
});
