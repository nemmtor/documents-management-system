import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { ContractRepository } from '../contract.repository';
import { SeeAttachmentCommand } from './see-attachment.command';

@CommandHandler(SeeAttachmentCommand)
export class SeeAttachmentCommandHandler
  implements ICommandHandler<SeeAttachmentCommand>
{
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SeeAttachmentCommand) {
    const getContractResult = await this.contractRepository.getById(
      command.payload.contractId,
    );
    if (getContractResult.isErr()) {
      return getContractResult;
    }
    const contract = this.publisher.mergeObjectContext(getContractResult.value);
    const seeAttachmentResult = contract.seeAttachment(
      command.payload.attachmentId,
    );
    if (seeAttachmentResult.isErr()) {
      return seeAttachmentResult;
    }
    await this.contractRepository.persist(contract);
    contract.commit();
    return ok();
  }
}
