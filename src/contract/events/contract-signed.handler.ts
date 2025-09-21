import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContractLogger } from '../contract.logger';
import { ContractSignedEvent } from './contract-signed.event';

@EventsHandler(ContractSignedEvent)
export class ContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(private readonly logger: ContractLogger) {}

  handle(event: ContractSignedEvent) {
    this.logger.log(
      `Contract with id: ${event.payload.contractId} got signed.`,
    );
  }
}
