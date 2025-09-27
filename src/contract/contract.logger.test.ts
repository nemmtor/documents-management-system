import { ContractLogger } from './contract.logger';

describe('ContractLogger', () => {
  it('should initialize with ContractModule context', () => {
    const logger = new ContractLogger();
    // @ts-expect-error context is protected field
    expect(logger.context).toBe('ContractModule');
  });
});
