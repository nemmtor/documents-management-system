import { AttachmentNotFoundError } from './attachment-not-found.error';

describe('AttachmentNotFoundError', () => {
  it('should have correct name', () => {
    const err = new AttachmentNotFoundError({
      attachmentId: '1',
      contractId: '1',
    });

    expect(err.name).toBe('AttachmentNotFoundError');
  });

  it('should hold attachmentId and contractId', () => {
    const err = new AttachmentNotFoundError({
      attachmentId: '1',
      contractId: '1',
    });

    expect(err.attachmentId).toBe('1');
    expect(err.contractId).toBe('1');
  });
});
