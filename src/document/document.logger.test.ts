import { DocumentLogger } from './document.logger';

describe('DocumentLogger', () => {
  it('should initialize with DocumentModule context', () => {
    const logger = new DocumentLogger();
    // @ts-expect-error context is protected field
    expect(logger.context).toBe('DocumentModule');
  });
});
