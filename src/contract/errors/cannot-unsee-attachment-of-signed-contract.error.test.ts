import { CannotUnseeAttachmentOfSignedContract } from './cannot-unsee-attachment-of-signed-contract.error';

describe('CannotUnseeAttachmentOfSignedContract', () => {
  it('should have correct name', () => {
    const err = new CannotUnseeAttachmentOfSignedContract('1');

    expect(err.name).toBe('CannotUnseeAttachmentOfSignedContract');
  });

  it('should hold contractId', () => {
    const err = new CannotUnseeAttachmentOfSignedContract('1');

    expect(err.contractId).toBe('1');
  });
});
