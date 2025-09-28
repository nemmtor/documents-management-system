import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { DocumentAggregate } from './document.aggregate';
import { DocumentDb, DocumentModel } from './document.db';
import { DocumentNotFoundError } from './errors/document-not-found.error';

@Injectable()
export class DocumentRepository {
  constructor(private readonly documentDb: DocumentDb) {}

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

  private toEntity(document: DocumentModel): DocumentAggregate {
    return new DocumentAggregate({
      id: document._id,
      createdAt: new Date(document.createdAt),
      content: document.content,
    });
  }

  private toPersistance(document: DocumentAggregate): DocumentModel {
    return {
      _id: document.id,
      createdAt: document.createdAt.toISOString(),
      content: document.content,
      updatedAt: new Date().toISOString(),
    };
  }
}
