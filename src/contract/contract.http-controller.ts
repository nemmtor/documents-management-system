import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { assertNever } from '../shared/assert-never';
import { CreateContractCommand } from './command/create-contract.command';
import { SeeAttachmentCommand } from './command/see-attachment.command';
import { SignContractCommand } from './command/sign-contract.command';
import { AttachmentNotFoundHttpError } from './errors/attachment-not-found.http-error';
import { ContractNotFoundHttpError } from './errors/contract-not-found.http-error';
import { GetAllContractsQuery } from './queries/get-all-contracts.query';
import { GetContractQuery } from './queries/get-contract.query';

@Controller('contracts')
export class ContractHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}
  @Get()
  @HttpCode(200)
  async findAll() {
    const contracts = await this.queryBus.execute(new GetAllContractsQuery());
    return contracts;
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') contractId: string) {
    const contract = await this.queryBus.execute(
      new GetContractQuery({ contractId }),
    );

    if (!contract) {
      throw new ContractNotFoundHttpError(contractId);
    }

    return contract;
  }

  @Post()
  @HttpCode(202)
  async create(@Body() dto: { attachmentIds: string[] }) {
    const { aggregateId } = await this.commandBus.execute(
      new CreateContractCommand({
        attachmentIds: dto.attachmentIds,
      }),
    );

    return { contractId: aggregateId };
  }

  @Post(':contractId/see-attachment/:attachmentId')
  @HttpCode(202)
  async seeAttachment(
    @Param('contractId') contractId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    const commandResult = await this.commandBus.execute(
      new SeeAttachmentCommand({
        contractId,
        attachmentId,
      }),
    );

    const mappedResult = commandResult.mapErr((err) => {
      if (err.name === 'ContractNotFoundError') {
        return new ContractNotFoundHttpError(contractId);
      }

      if (err.name === 'AttachmentNotFoundError') {
        return new AttachmentNotFoundHttpError({ contractId, attachmentId });
      }

      return assertNever(err, 'Unexpected error type');
    });

    if (mappedResult.isErr()) {
      throw mappedResult.error;
    }
  }

  @Post(':contractId/sign')
  @HttpCode(202)
  async sign(@Param('contractId') contractId: string) {
    const commandResult = await this.commandBus.execute(
      new SignContractCommand({
        contractId,
      }),
    );

    const mappedResult = commandResult.mapErr((err) => {
      if (err.name === 'ContractNotFoundError') {
        return new ContractNotFoundHttpError(contractId);
      }

      if (err.name === 'CannotSignContractWithUnseenAttachmentsError') {
        return new BadRequestException(
          'Cannot sign contract with unseen attachments',
        );
      }
      return assertNever(err, 'Unexpected error type');
    });

    if (mappedResult.isErr()) {
      throw mappedResult.error;
    }
  }
}
