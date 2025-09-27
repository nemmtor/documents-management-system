import { ContractNotFoundHttpError } from './contract-not-found.http-error';

describe('ContractNotFoundHttpError', () => {
  it('should include meaningful message', () => {
    const err = new ContractNotFoundHttpError('1');

    expect(err.message).toBe('Contract not found');
  });

  it('should hold contractId', () => {
    const err = new ContractNotFoundHttpError('1');

    expect(err.contractId).toBe('1');
  });
});
