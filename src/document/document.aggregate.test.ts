import { CreateDocumentAggregatePayloadBuilder } from './__test-utils__/create-document-aggregate-payload.builder';
import { ReconstituteDocumentAggregatePayloadBuilder } from './__test-utils__/reconstitute-document-aggregate-payload.builder';
import { DocumentAggregate } from './document.aggregate';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { DocumentContentUpdatedEvent } from './events/document-content-updated.event';
import { DocumentCreatedEvent } from './events/document-created.event';

describe('DocumentAggregate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an aggregate with provided content', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().withContent('content').build(),
      );

      expect(documentAggregate.content).toBe('content');
    });

    it('should create an aggregate with generated uuid', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      expect(documentAggregate.id).toEqual(expect.any(String));
    });

    it('should create an aggregate with createdAt as current date', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      expect(documentAggregate.createdAt).toEqual(new Date());
    });

    it('should create an aggregate with updatedAt as current date', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      expect(documentAggregate.updatedAt).toEqual(new Date());
    });

    it('should apply DocumentCreatedEvent', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().withContent('content').build(),
      );
      // need to test this1 like so because cannot spy early on something that is already called in the function itself
      const appliedEvents = documentAggregate.getUncommittedEvents();
      const appliedEvent = appliedEvents[0];

      expect(appliedEvents).toHaveLength(1);
      expect(appliedEvent).toEqual(
        expect.objectContaining({
          constructor: DocumentCreatedEvent,
          payload: {
            id: documentAggregate.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            content: 'content',
          },
        }),
      );
    });
  });

  describe('reconstitute', () => {
    it('should create an aggregate with provided id', () => {
      const documentAggregate = DocumentAggregate.reconstitute(
        aReconstituteDocumentAggregatePayload().withId('1').build(),
      );

      expect(documentAggregate.id).toBe('1');
    });

    it('should create an aggregate with provided content', () => {
      const documentAggregate = DocumentAggregate.reconstitute(
        aReconstituteDocumentAggregatePayload().withContent('content').build(),
      );

      expect(documentAggregate.content).toBe('content');
    });

    it('should create an aggregate with provided created at date', () => {
      const documentAggregate = DocumentAggregate.reconstitute(
        aReconstituteDocumentAggregatePayload()
          .withCreatedAt(new Date())
          .build(),
      );

      expect(documentAggregate.createdAt).toEqual(new Date());
    });

    it('should create an aggregate with provided updated at date', () => {
      const documentAggregate = DocumentAggregate.reconstitute(
        aReconstituteDocumentAggregatePayload()
          .withUpdatedAt(new Date())
          .build(),
      );

      expect(documentAggregate.updatedAt).toEqual(new Date());
    });

    it('should not apply any event', () => {
      const documentAggregate = DocumentAggregate.reconstitute(
        aReconstituteDocumentAggregatePayload().build(),
      );

      // need to test this1 like so because cannot spy early on something that is already called in the function itself
      const appliedEvents = documentAggregate.getUncommittedEvents();
      expect(appliedEvents).toHaveLength(0);
    });
  });

  describe('content updating', () => {
    it('should be successfull', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      const result = documentAggregate.updateContent('new');

      expect(result.isOk()).toBe(true);
    });

    it('should update content', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().withContent('old').build(),
      );

      documentAggregate.updateContent('new');

      expect(documentAggregate.content).toBe('new');
    });

    it('should bump updated at date', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      jest.advanceTimersByTime(1);
      documentAggregate.updateContent('new');

      expect(documentAggregate.updatedAt).toEqual(new Date());
    });

    it('should fail with DocumentTooOldForContentUpdateError if document is older than 1 year', () => {
      jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
      const result = documentAggregate.updateContent('new');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: DocumentTooOldForContentUpdateError,
        }),
      );
      jest.setSystemTime(jest.getRealSystemTime());
    });

    it('should fail with DocumentTooOldForContentUpdateError if document is slightly older than 1 year', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      jest.setSystemTime(new Date('2025-01-01T00:00:01.000Z'));
      const result = documentAggregate.updateContent('new');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: DocumentTooOldForContentUpdateError,
        }),
      );
      jest.setSystemTime(jest.getRealSystemTime());
    });

    it('should not fail if document is exactly 1 year old', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

      expect(documentAggregate.updateContent('new').isOk()).toBe(true);
    });

    it('should not fail if document is under 1 year old', () => {
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );
      jest.setSystemTime(new Date('2025-02-01T00:00:00.000Z'));

      expect(documentAggregate.updateContent('new').isOk()).toBe(true);
    });

    it('should not fail if document is not old at all', () => {
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );

      expect(documentAggregate.updateContent('new').isOk()).toBe(true);
    });

    it('should apply DocumentContentUpdatedEvent on success', () => {
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().withContent('old').build(),
      );
      const applySpy = jest.spyOn(documentAggregate, 'apply');

      documentAggregate.updateContent('new');

      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: DocumentContentUpdatedEvent,
          payload: {
            documentId: documentAggregate.id,
            content: 'new',
            updatedAt: new Date(),
          },
        }),
      );
    });

    it('should not apply DocumentContentUpdatedEvent if document is older than 1 year', () => {
      jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
      const documentAggregate = DocumentAggregate.create(
        aCreateDocumentAggregatePayload().build(),
      );
      const applySpy = jest.spyOn(documentAggregate, 'apply');

      jest.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
      documentAggregate.updateContent('new');

      expect(applySpy).not.toHaveBeenCalled();
    });
  });
});

const aCreateDocumentAggregatePayload = () =>
  new CreateDocumentAggregatePayloadBuilder();
const aReconstituteDocumentAggregatePayload = () =>
  new ReconstituteDocumentAggregatePayloadBuilder();
