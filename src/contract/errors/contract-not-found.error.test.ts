import { ContractNotFoundError } from './contract-not-found.error';

describe('ContractNotFoundError', () => {
  it('should have correct name', () => {
    const err = new ContractNotFoundError('1');

    expect(err.name).toBe('ContractNotFoundError');
  });

  it('should hold contractId', () => {
    const err = new ContractNotFoundError('1');

    expect(err.contractId).toBe('1');
  });
});
