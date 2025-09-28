import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DOCUMENT_DB_CLIENT } from './document.constants';

export type DocumentModel = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
};

type DocumentCollection = Collection<DocumentModel>;

@Injectable()
export class DocumentDb {
  private readonly collection: DocumentCollection;
  constructor(
    @Inject(DOCUMENT_DB_CLIENT) private readonly documentDbClient: Db,
  ) {
    this.collection =
      this.documentDbClient.collection<DocumentModel>('document');
  }

  async findOne(
    ...options: Parameters<DocumentCollection['findOne']>
  ): Promise<DocumentModel | null> {
    return this.collection.findOne(...options);
  }

  async updateOne(...options: Parameters<DocumentCollection['updateOne']>) {
    await this.collection.updateOne(...options);
  }
}
