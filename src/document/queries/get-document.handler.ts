import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DocumentReadDbClient } from '../document-read.db-client';
import { DocumentReadModel, GetDocumentQuery } from './get-document.query';

@QueryHandler(GetDocumentQuery)
export class GetDocumentQueryHandler
  implements IQueryHandler<GetDocumentQuery>
{
  constructor(private readonly readDbClient: DocumentReadDbClient) {}

  async execute(query: GetDocumentQuery) {
    const foundDocument = await this.readDbClient.findOne({
      _id: query.payload.documentId,
    });

    if (!foundDocument) {
      return undefined;
    }

    const readModel: DocumentReadModel = {
      id: foundDocument._id,
      createdAt: foundDocument.createdAt.toISOString(),
      updatedAt: foundDocument.updatedAt.toISOString(),
      content: foundDocument.content,
    };

    return readModel;
  }
}
