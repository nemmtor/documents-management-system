import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ContractService } from './contract.service';

@Controller()
export class ContractEventController {
  constructor(private readonly contractService: ContractService) {}

  @EventPattern('document-content-updated')
  async handleAttachmentUpdated(data: { payload: { documentId: string } }) {
    await this.contractService.markAttachmentAsUnseen(data.payload.documentId);
  }
}
