import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { DocumentAggregate } from './document.aggregate';
import {
  DocumentWriteDbClient,
  DocumentWritePersistanceModel,
} from './document-write.db-client';
import { DocumentNotFoundError } from './errors/document-not-found.error';

@Injectable()
export class DocumentRepository {
  constructor(private readonly documentDb: DocumentWriteDbClient) {}

  async getById(id: string) {
    const foundDocument = await this.documentDb.findOne({ _id: id });

    if (!foundDocument) {
      return err(new DocumentNotFoundError(id));
    }

    return ok(this.toEntity({ ...foundDocument, _id: foundDocument._id }));
  }

  async persist(document: DocumentAggregate) {
    const persistancePayload = this.toPersistance(document);

    await this.documentDb.updateOne(
      { _id: persistancePayload._id },
      { $set: persistancePayload },
      { upsert: true },
    );
  }

  private toEntity(document: DocumentWritePersistanceModel): DocumentAggregate {
    return DocumentAggregate.reconstitute({
      id: document._id,
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
      content: document.content,
    });
  }

  private toPersistance(
    document: DocumentAggregate,
  ): DocumentWritePersistanceModel {
    return {
      _id: document.id,
      createdAt: document.createdAt,
      updatedAt: document.createdAt,
      content: document.content,
    };
  }
}
