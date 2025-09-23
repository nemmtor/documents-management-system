import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';
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
    const getContractResult = await this.contractRepository.getById(
      command.payload.contractId,
    );
    if (getContractResult.isErr()) {
      return err(getContractResult.error);
    }
    const contract = this.publisher.mergeObjectContext(getContractResult.value);
    const signResult = contract.sign();
    if (signResult.isErr()) {
      return signResult;
    }
    await this.contractRepository.persist(contract);
    contract.commit();
    return ok();
  }
}
