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
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { assertNever } from '../shared/assert-never';
import { CreateContractCommand } from './command/create-contract.command';
import { SeeAttachmentCommand } from './command/see-attachment.command';
import { SignContractCommand } from './command/sign-contract.command';
import { CreateContractRequestDTO } from './dto/create-contract-request.dto';
import { CreateContractResponseDTO } from './dto/create-contract-response.dto';
import { GetAllContractsResponseDTO } from './dto/get-all-contracts-response.dto';
import { GetContractParamsDTO } from './dto/get-contract-params.dto';
import { GetContractResponseDTO } from './dto/get-contract-response.dto';
import { SeeAttachmentParamsDTO } from './dto/see-attachment-params.dto';
import { SignContractParamsDTO } from './dto/sign-contract-params.dto';
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
  @ZodResponse({
    status: 200,
    description: 'List of contracts',
    type: GetAllContractsResponseDTO,
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async findAll() {
    const contracts = await this.queryBus.execute(new GetAllContractsQuery());
    return contracts;
  }

  @Get(':contractId')
  @ZodResponse({
    status: 200,
    description: 'Contract',
    type: GetContractResponseDTO,
  })
  @ApiNotFoundResponse({ description: 'Contract not found' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async findOne(@Param() params: GetContractParamsDTO) {
    const { contractId } = params;
    const contract = await this.queryBus.execute(
      new GetContractQuery({ contractId }),
    );

    if (!contract) {
      throw new ContractNotFoundHttpError(contractId);
    }

    return contract;
  }

  @Post()
  @ZodResponse({
    status: 201,
    description: 'Contract was created',
    type: CreateContractResponseDTO,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async create(@Body() dto: CreateContractRequestDTO) {
    const { aggregateId } = await this.commandBus.execute(
      new CreateContractCommand({
        attachmentIds: dto.attachmentIds,
      }),
    );

    return { contractId: aggregateId };
  }

  @Post(':contractId/see-attachment/:attachmentId')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Attachment marked as seen' })
  @ApiNotFoundResponse({ description: 'Contract or attachment not found' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async seeAttachment(@Param() params: SeeAttachmentParamsDTO) {
    const { attachmentId, contractId } = params;
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
  @HttpCode(200)
  @ApiOkResponse({ description: 'Contract signed' })
  @ApiBadRequestResponse({ description: 'Contract has unseen attachments' })
  @ApiNotFoundResponse({ description: 'Contract not found' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async sign(@Param() params: SignContractParamsDTO) {
    const { contractId } = params;
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
