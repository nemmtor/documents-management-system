import { DocumentAggregate } from './document.aggregate';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { DocumentContentUpdatedEvent } from './events/document-content-updated.event';

describe('DocumentAggregate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('content updating', () => {
    it('should update content', () => {
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: new Date(),
        content: 'hi',
      });

      documentAggregate.updateContent('new');

      expect(documentAggregate.content).toBe('new');
    });

    it('should be successfull', () => {
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: new Date(),
        content: 'hi',
      });

      const result = documentAggregate.updateContent('new');

      expect(result.isOk()).toBe(true);
    });

    it('should fail with DocumentTooOldForContentUpdateError if document is older than 1 year', () => {
      const overOneYearAgo = new Date('2022-12-31T11:59:59.999Z');
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: overOneYearAgo,
        content: 'hi',
      });

      const result = documentAggregate.updateContent('new content');

      expect(result._unsafeUnwrapErr()).toEqual(
        expect.objectContaining({
          constructor: DocumentTooOldForContentUpdateError,
        }),
      );
    });

    it('should not fail if document is 1 year old', () => {
      const oneYearAgo = new Date('2023-01-01T12:00:00.000Z');
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: oneYearAgo,
        content: 'hi',
      });

      expect(documentAggregate.updateContent('new content').isOk()).toBe(true);
    });

    it('should apply DocumentContentUpdatedEvent on success', () => {
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: new Date(),
        content: 'original content',
      });
      const applySpy = jest.spyOn(documentAggregate, 'apply');

      documentAggregate.updateContent('new content');

      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          constructor: DocumentContentUpdatedEvent,
          payload: { documentId: '1' },
        }),
      );
    });

    it('should not apply DocumentContentUpdatedEvent if document is older than 1 year', () => {
      const overOneYearAgo = new Date('2022-12-31T11:59:59.999Z');
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: overOneYearAgo,
        content: 'original content',
      });
      const applySpy = jest.spyOn(documentAggregate, 'apply');

      documentAggregate.updateContent('new content');

      expect(applySpy).not.toHaveBeenCalled();
    });
  });
});
