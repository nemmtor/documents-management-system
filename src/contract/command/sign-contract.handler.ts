import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { ContractRepository } from '../contract.repository';
import { SignContractCommand } from './sign-contract.command';

@CommandHandler(SignContractCommand)
export class SignContractCommandHandler
  implements ICommandHandler<SignContractCommand>
{
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SignContractCommand) {
    const contract = this.publisher.mergeObjectContext(
      await this.contractRepository.getById(command.payload.contractId),
    );
    contract.sign();
    await this.contractRepository.persist(contract);
    contract.commit();
  }
}
