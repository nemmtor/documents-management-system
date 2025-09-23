import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnseeAttachmentCommand } from './command/unsee-attachment.command';
import { ContractRepository } from './contract.repository';

@Injectable()
export class ContractService {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async markDocumentAsUnseen(attachmentId: string) {
    const contracts = await this.contractRepository.findAllUnsignedIds();

    for (const contract of contracts) {
      this.commandBus.execute(
        new UnseeAttachmentCommand({ contractId: contract.id, attachmentId }),
      );
    }
  }
}
