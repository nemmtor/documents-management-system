import { CannotSignContractWithUnseenAttachmentsError } from './cannot-sign-contract-with-unseen-attachments.error';

describe('CannotSignContractWithUnseenAttachmentsError', () => {
  it('should have correct name', () => {
    const err = new CannotSignContractWithUnseenAttachmentsError('1');

    expect(err.name).toBe('CannotSignContractWithUnseenAttachmentsError');
  });

  it('should hold contractId', () => {
    const err = new CannotSignContractWithUnseenAttachmentsError('1');

    expect(err.contractId).toBe('1');
  });
});
