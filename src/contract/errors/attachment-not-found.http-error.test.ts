import { AttachmentNotFoundHttpError } from './attachment-not-found.http-error';

describe('AttachmentNotFoundHttpError', () => {
  it('should include meaningful message', () => {
    const err = new AttachmentNotFoundHttpError({
      attachmentId: '1',
      contractId: '1',
    });

    expect(err.message).toBe('Attachment not found');
  });

  it('should hold contractId and attachmentId', () => {
    const err = new AttachmentNotFoundHttpError({
      attachmentId: '1',
      contractId: '1',
    });

    expect(err.attachmentId).toBe('1');
    expect(err.contractId).toBe('1');
  });
});
