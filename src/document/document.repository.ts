import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { DocumentAggregate } from './document.aggregate';
import { DocumentDb } from './document.db';
import type { DocumentModel } from './document.model';
import { DocumentNotFoundError } from './errors/document-not-found.error';

@Injectable()
export class DocumentRepository {
  constructor(private readonly documentDb: DocumentDb) {}

  async getOneById(id: string) {
    const foundDocument = await this.documentDb.find(id);

    if (!foundDocument) {
      return err(new DocumentNotFoundError(id));
    }

    return ok(this.toEntity(foundDocument));
  }

  async persist(document: DocumentAggregate) {
    const documentPersistanceObject = this.toPersistance(document);
    await this.documentDb.insertOrUpdate(documentPersistanceObject);
  }

  private toEntity(document: DocumentModel): DocumentAggregate {
    return new DocumentAggregate({
      id: document.id,
      createdAt: new Date(document.createdAt),
      content: document.content,
    });
  }

  private toPersistance(document: DocumentAggregate): DocumentModel {
    return {
      id: document.id,
      createdAt: document.createdAt.toISOString(),
      content: document.content,
      updatedAt: new Date().toISOString(),
    };
  }
}
