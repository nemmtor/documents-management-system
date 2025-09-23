import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { ContractRepository } from '../contract.repository';
import { UnseeAttachmentCommand } from './unsee-attachment.command';

@CommandHandler(UnseeAttachmentCommand)
export class UnseeAttachmentCommandHandler
  implements ICommandHandler<UnseeAttachmentCommand>
{
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UnseeAttachmentCommand) {
    const getContractResult = await this.contractRepository.getById(
      command.payload.contractId,
    );
    if (getContractResult.isErr()) {
      return getContractResult;
    }
    const contract = this.publisher.mergeObjectContext(getContractResult.value);
    if (!contract.hasAttachmentWithId(command.payload.attachmentId)) {
      return ok();
    }

    const unseeAttachmentResult = contract.unseeAttachment(
      command.payload.attachmentId,
    );
    if (unseeAttachmentResult.isErr()) {
      return unseeAttachmentResult;
    }
    await this.contractRepository.persist(contract);
    contract.commit();
    return ok();
  }
}
