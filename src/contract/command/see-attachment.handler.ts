import {
  CommandHandler,
  EventPublisher,
  type ICommandHandler,
} from '@nestjs/cqrs';
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
    const contract = this.publisher.mergeObjectContext(
      await this.contractRepository.getById(command.payload.contractId),
    );
    contract.seeAttachment(command.payload.attachmentId);
    await this.contractRepository.persist(contract);
    contract.commit();
  }
}
