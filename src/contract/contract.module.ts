/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateContractCommandHandler } from './command/create-contract.handler';
import { SeeAttachmentCommandHandler } from './command/see-attachment.handler';
import { SignContractCommandHandler } from './command/sign-contract.handler';
import { UnseeAttachmentCommandHandler } from './command/unsee-attachment.handler';
import { ContractDb } from './contract.db';
import { ContractEventController } from './contract.event-controller';
import { ContractHttpController } from './contract.http-controller';
import { ContractLogger } from './contract.logger';
import { ContractRepository } from './contract.repository';
import { ContractService } from './contract.service';
import { ContractBecameSignableEventHandler } from './events/contract-became-signable.handler';
import { ContractBecameUnsignableEventHandler } from './events/contract-became-unsignable.handler';
import { ContractSignedEventHandler } from './events/contract-signed.handler';
import { GetAllContractsQueryHandler } from './queries/get-all-contracts.handler';
import { GetContractQueryHandler } from './queries/get-contract.handler';

const queryHandlers = [
  GetContractQueryHandler,
  GetAllContractsQueryHandler,
] as const;
const commandHandlers = [
  CreateContractCommandHandler,
  UnseeAttachmentCommandHandler,
  SeeAttachmentCommandHandler,
] as const;
const eventHandlers = [
  ContractBecameSignableEventHandler,
  ContractBecameUnsignableEventHandler,
  ContractSignedEventHandler,
  SignContractCommandHandler,
] as const;

@Module({
  imports: [CqrsModule],
  providers: [
    ContractDb,
    ContractRepository,
    ContractService,
    ContractLogger,
    ...queryHandlers,
    ...commandHandlers,
    ...eventHandlers,
  ],
  controllers: [ContractEventController, ContractHttpController],
})
export class ContractModule {}
