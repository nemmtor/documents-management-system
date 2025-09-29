import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
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
import { CreateDocumentCommand } from './commands/create-document.command';
import { UpdateDocumentContentCommand } from './commands/update-document-content.command';
import { CreateDocumentRequestDTO } from './dto/create-document-request.dto';
import { CreateDocumentResponseDTO } from './dto/create-document-response.dto';
import { GetDocumentParamsDTO } from './dto/get-document-params.dto';
import { GetDocumentResponseDTO } from './dto/get-document-response.dto';
import { UpdateDocumentContentParamsDTO } from './dto/update-document-content-params.dto';
import { UpdateDocumentContentRequestDTO } from './dto/update-document-content-request.dto';
import { DocumentNotFoundHttpError } from './errors/document-not-found.http-error';
import { GetDocumentQuery } from './queries/get-document.query';

@Controller('documents')
export class DocumentHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':documentId')
  @ZodResponse({
    status: 200,
    type: GetDocumentResponseDTO,
    description: 'Document',
  })
  @ApiNotFoundResponse({ description: 'Document not found' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async findOne(@Param() params: GetDocumentParamsDTO) {
    const { documentId } = params;
    const document = await this.queryBus.execute(
      new GetDocumentQuery({ documentId }),
    );

    if (!document) {
      throw new DocumentNotFoundHttpError(documentId);
    }

    return document;
  }

  @Post()
  @ZodResponse({
    status: 201,
    type: CreateDocumentResponseDTO,
    description: 'Document created',
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async create(@Body() dto: CreateDocumentRequestDTO) {
    const { documentId } = await this.commandBus.execute(
      new CreateDocumentCommand({
        content: dto.content,
      }),
    );

    return { documentId };
  }

  @Patch(':documentId')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Document content updated' })
  @ApiBadRequestResponse({ description: 'Document too old for content update' })
  @ApiNotFoundResponse({ description: 'Document not found' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async updateContent(
    @Param() params: UpdateDocumentContentParamsDTO,
    @Body() dto: UpdateDocumentContentRequestDTO,
  ) {
    const { documentId } = params;
    const commandResult = await this.commandBus.execute(
      new UpdateDocumentContentCommand({
        content: dto.content,
        documentId: documentId,
      }),
    );

    const mappedResult = commandResult.mapErr((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return new DocumentNotFoundHttpError(documentId);
      }

      if (err.name === 'DocumentTooOldForContentUpdateError') {
        return new BadRequestException('Document too old for content update');
      }

      return assertNever(err, 'Unexpected error type');
    });

    if (mappedResult.isErr()) {
      throw mappedResult.error;
    }
  }
}
