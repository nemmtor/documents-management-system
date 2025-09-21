import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
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
    const contract = this.publisher.mergeObjectContext(
      await this.contractRepository.getById(command.payload.contractId),
    );
    if (!contract.hasAttachmentWithId(command.payload.attachmentId)) {
      return;
    }

    contract.unseeAttachment(command.payload.attachmentId);
    await this.contractRepository.persist(contract);
    contract.commit();
  }
}
