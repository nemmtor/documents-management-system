import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContractLogger } from '../contract.logger';
import { ContractBecameSignableEvent } from './contract-became-signable.event';

@EventsHandler(ContractBecameSignableEvent)
export class ContractBecameSignableEventHandler
  implements IEventHandler<ContractBecameSignableEvent>
{
  constructor(private readonly logger: ContractLogger) {}

  handle(event: ContractBecameSignableEvent) {
    this.logger.log(
      `Contract with id: ${event.payload.contractId} became signable.`,
    );
  }
}
