import { DocumentNotFoundError } from './document-not-found.error';

describe('DocumentNotFoundError', () => {
  it('should have correct name', () => {
    const err = new DocumentNotFoundError('1');

    expect(err.name).toBe('DocumentNotFoundError');
  });

  it('should hold documentId', () => {
    const err = new DocumentNotFoundError('1');

    expect(err.documentId).toBe('1');
  });
});
