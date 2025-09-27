import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ContractLogger } from '../contract.logger';
import { ContractBecameUnsignableEvent } from './contract-became-unsignable.event';
import { ContractBecameUnsignableEventHandler } from './contract-became-unsignable.handler';

describe('ContractBecameUnsignableEvent', () => {
  let eventHandler: ContractBecameUnsignableEventHandler;
  let documentLogger: ContractLogger;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ContractBecameUnsignableEventHandler,
        { provide: ContractLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();
    eventHandler = mod.get(ContractBecameUnsignableEventHandler);
    documentLogger = mod.get(ContractLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log information about contract being unsignable', () => {
    const contractId = 'contract-id';
    const logSpy = jest.spyOn(documentLogger, 'log');
    eventHandler.handle(new ContractBecameUnsignableEvent({ contractId }));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(contractId));
  });
});
