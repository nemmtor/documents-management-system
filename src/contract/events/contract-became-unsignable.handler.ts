import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContractLogger } from '../contract.logger';
import { ContractBecameUnsignableEvent } from './contract-became-unsignable.event';

@EventsHandler(ContractBecameUnsignableEvent)
export class ContractBecameUnsignableEventHandler
  implements IEventHandler<ContractBecameUnsignableEvent>
{
  constructor(private readonly logger: ContractLogger) {}

  handle(event: ContractBecameUnsignableEvent) {
    this.logger.log(
      `Contract with id: ${event.payload.contractId} became unsignable.`,
    );
  }
}
