import { DocumentTooOldForContentUpdateError } from './document-too-old-for-content-update.error';

describe('DocumentTooOldForContentUpdateError', () => {
  it('should have correct name', () => {
    const err = new DocumentTooOldForContentUpdateError('1');

    expect(err.name).toBe('DocumentTooOldForContentUpdateError');
  });

  it('should hold documentId', () => {
    const err = new DocumentTooOldForContentUpdateError('1');

    expect(err.documentId).toBe('1');
  });
});
