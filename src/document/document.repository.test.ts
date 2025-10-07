import { Test, TestingModule } from '@nestjs/testing';
import { CreateDocumentAggregatePayloadBuilder } from './__test-utils__/create-document-aggregate-payload.builder';
import { DocumentWritePersistanceModelBuilder } from './__test-utils__/document-write-persistance-model.builder';
import { DocumentAggregate } from './document.aggregate';
import { DocumentRepository } from './document.repository';
import { DocumentWriteDbClient } from './document-write.db-client';
import { DocumentNotFoundError } from './errors/document-not-found.error';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let db: DocumentWriteDbClient;

  beforeEach(async () => {
    jest.useFakeTimers();

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
      const persistedDocument = aPersistedDocument().withId('1').build();
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(persistedDocument);

      const result = await repository.getById('1');
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate).toBeInstanceOf(DocumentAggregate);
      expect(documentAggregate.id).toBe('1');
    });

    it('should correctly map to entity', async () => {
      const persistedDocument = aPersistedDocument()
        .withId('1')
        .withContent('content')
        .withCreatedAt(new Date())
        .withUpdatedAt(new Date())
        .build();
      jest.spyOn(db, 'findOne').mockResolvedValueOnce(persistedDocument);

      const result = await repository.getById('1');
      const documentAggregate = result._unsafeUnwrap();

      expect(documentAggregate.id).toBe('1');
      expect(documentAggregate.content).toBe('content');
      expect(documentAggregate.createdAt).toEqual(new Date());
      expect(documentAggregate.updatedAt).toEqual(new Date());
    });

    it('should query db with correct id', async () => {
      const persistedDocument = aPersistedDocument().withId('1').build();
      const findSpy = jest
        .spyOn(db, 'findOne')
        .mockResolvedValueOnce(persistedDocument);

      await repository.getById('1');

      expect(findSpy).toHaveBeenCalledTimes(1);
      expect(findSpy).toHaveBeenCalledWith({ _id: '1' });
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
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().withContent('content').build(),
      );
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
            content: 'content',
            createdAt: documentAggregate.createdAt,
            updatedAt: documentAggregate.updatedAt,
          },
        },
        { upsert: true },
      );
    });
  });
});

const aPersistedDocument = () => new DocumentWritePersistanceModelBuilder();
const aCreateDocumentAggregatePayload = () =>
  new CreateDocumentAggregatePayloadBuilder();
