import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ContractLogger } from '../contract.logger';
import { ContractBecameSignableEvent } from './contract-became-signable.event';
import { ContractBecameSignableEventHandler } from './contract-became-signable.handler';

describe('ContractBecameSignableEvent', () => {
  let eventHandler: ContractBecameSignableEventHandler;
  let documentLogger: ContractLogger;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ContractBecameSignableEventHandler,
        { provide: ContractLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();
    eventHandler = mod.get(ContractBecameSignableEventHandler);
    documentLogger = mod.get(ContractLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log information about contract being signable', () => {
    const contractId = 'contract-id';
    const logSpy = jest.spyOn(documentLogger, 'log');
    eventHandler.handle(new ContractBecameSignableEvent({ contractId }));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(contractId));
  });
});
