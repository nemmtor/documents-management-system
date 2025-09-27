import { DocumentNotFoundHttpError } from './document-not-found.http-error';

describe('DocumentNotFoundHttpError', () => {
  it('should include meaningful message', () => {
    const err = new DocumentNotFoundHttpError('1');

    expect(err.message).toBe('Document not found');
  });

  it('should hold documentId', () => {
    const err = new DocumentNotFoundHttpError('1');

    expect(err.documentId).toBe('1');
  });
});
