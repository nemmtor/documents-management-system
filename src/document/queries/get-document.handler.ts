import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DocumentDb } from '../document.db';
import { DocumentReadModel, GetDocumentQuery } from './get-document.query';

@QueryHandler(GetDocumentQuery)
export class GetDocumentQueryHandler
  implements IQueryHandler<GetDocumentQuery>
{
  constructor(private readonly documentDb: DocumentDb) {}

  async execute(query: GetDocumentQuery) {
    const foundDocument = await this.documentDb.findOne({
      _id: query.payload.documentId,
    });

    if (!foundDocument) {
      return undefined;
    }

    const readModel: DocumentReadModel = {
      id: foundDocument._id,
      createdAt: foundDocument.createdAt,
      updatedAt: foundDocument.updatedAt,
      content: foundDocument.content,
    };

    return readModel;
  }
}
