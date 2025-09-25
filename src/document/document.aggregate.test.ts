import { DocumentAggregate } from './document.aggregate';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { DocumentContentUpdatedEvent } from './events/document-content-updated.event';

describe('DocumentAggregate', () => {
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

    it('should fail with DocumentTooOldForContentUpdateError if document is older than 1 year', () => {
      const oneYearAndOneDayAgo = new Date();
      oneYearAndOneDayAgo.setFullYear(oneYearAndOneDayAgo.getFullYear() - 1);
      oneYearAndOneDayAgo.setDate(oneYearAndOneDayAgo.getDate() - 1);
      const documentAggregate = new DocumentAggregate({
        id: '1',
        createdAt: oneYearAndOneDayAgo,
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
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
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

    it.todo('should not apply DocumentContentUpdatedEvent on failure');
  });
});
