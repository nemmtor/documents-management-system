import { randomUUID } from 'node:crypto';
import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { ContractAggregate } from '../contract.aggregate';
import { ContractRepository } from '../contract.repository';
import { CreateContractCommand } from './create-contract.command';

@CommandHandler(CreateContractCommand)
export class CreateContractCommandHandler
  implements ICommandHandler<CreateContractCommand>
{
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateContractCommand) {
    const contract = this.publisher.mergeObjectContext(
      new ContractAggregate({
        id: randomUUID(),
        createdAt: new Date(),
        attachments: command.payload.attachmentIds.map((id) => ({
          id,
          isSeen: false,
        })),
        isSigned: false,
      }),
    );
    await this.contractRepository.persist(contract);
    contract.commit();

    return {
      aggregateId: contract.id,
    };
  }
}
