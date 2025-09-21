/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import type { DocumentModel } from './document.model';

// TODO: replace with real db
@Injectable()
export class DocumentDb {
  private data: DocumentModel[] = [];

  async insertOrUpdate(document: DocumentModel) {
    const existingIndex = this.data.findIndex((doc) => doc.id === document.id);

    if (existingIndex !== -1) {
      const updatedDocument: DocumentModel = {
        ...document,
        createdAt: this.data[existingIndex].createdAt,
      };
      this.data[existingIndex] = updatedDocument;
      return;
    }

    const newDocument: DocumentModel = {
      ...document,
      createdAt: document.createdAt,
    };

    this.data.push(newDocument);
  }

  async find(id: string) {
    return this.data.find((d) => d.id === id);
  }
}
