import { CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ContractLogger } from '../contract.logger';
import { ContractSignedEvent } from './contract-signed.event';
import { ContractSignedEventHandler } from './contract-signed.handler';

describe('ContractSignedEvent', () => {
  let eventHandler: ContractSignedEventHandler;
  let documentLogger: ContractLogger;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ContractSignedEventHandler,
        { provide: ContractLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();
    eventHandler = mod.get(ContractSignedEventHandler);
    documentLogger = mod.get(ContractLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log information about contract being signed', () => {
    const contractId = 'contract-id';
    const logSpy = jest.spyOn(documentLogger, 'log');
    eventHandler.handle(new ContractSignedEvent({ contractId }));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(contractId));
  });
});
