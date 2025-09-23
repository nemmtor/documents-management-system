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
import { assertNever } from '../shared/assert-never';
import { CreateDocumentCommand } from './commands/create-document.command';
import { UpdateDocumentContentCommand } from './commands/update-document-content.command';
import { DocumentNotFoundError } from './errors/document-not-found.error';
import { DocumentNotFoundHttpError } from './errors/document-not-found.http-error';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { GetDocumentQuery } from './queries/get-document.query';

@Controller('documents')
export class DocumentHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') documentId: string) {
    const document = await this.queryBus.execute(
      new GetDocumentQuery({ documentId }),
    );

    if (!document) {
      throw new DocumentNotFoundHttpError(documentId);
    }

    return document;
  }

  @Post()
  @HttpCode(202)
  async create(@Body() dto: { content: string }) {
    const { aggregateId } = await this.commandBus.execute(
      new CreateDocumentCommand({
        content: dto.content,
      }),
    );

    return { documentId: aggregateId };
  }

  @Patch(':id')
  @HttpCode(202)
  async updateContent(
    @Param('id') documentId: string,
    @Body() dto: { content: string },
  ) {
    const commandResult = await this.commandBus.execute(
      new UpdateDocumentContentCommand({
        content: dto.content,
        documentId: documentId,
      }),
    );

    const mappedResult = commandResult.mapErr((err) => {
      if (err instanceof DocumentNotFoundError) {
        return new DocumentNotFoundHttpError(documentId);
      }

      if (err instanceof DocumentTooOldForContentUpdateError) {
        return new BadRequestException('Document too old for content update');
      }

      return assertNever(err, 'Unexpected error type');
    });

    if (mappedResult.isErr()) {
      throw mappedResult.error;
    }
  }
}
