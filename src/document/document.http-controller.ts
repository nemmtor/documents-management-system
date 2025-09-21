import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDocumentCommand } from './commands/create-document.command';
import { UpdateDocumentContentCommand } from './commands/update-document-content.command';
import { DocumentNotFoundError } from './errors/document-not-found.error';
import { DocumentNotFoundHttpError } from './errors/document-not-found.http-error';
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
    try {
      await this.commandBus.execute(
        new UpdateDocumentContentCommand({
          content: dto.content,
          documentId: documentId,
        }),
      );
    } catch (error) {
      if (error instanceof DocumentNotFoundError) {
        throw new DocumentNotFoundHttpError(documentId);
      }
      throw error;
    }
  }
}
