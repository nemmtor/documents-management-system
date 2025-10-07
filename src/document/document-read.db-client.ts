import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DOCUMENT_READ_DB } from './document.constants';

export type DocumentReadPersistanceModel = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
};

type DocumentReadCollection = Collection<DocumentReadPersistanceModel>;

// TODO: write tests
@Injectable()
export class DocumentReadDbClient {
  private readonly collection: DocumentReadCollection;
  constructor(@Inject(DOCUMENT_READ_DB) private readonly documentDbClient: Db) {
    this.collection =
      this.documentDbClient.collection<DocumentReadPersistanceModel>(
        'document-read',
      );
  }

  async findOne(
    ...options: Parameters<DocumentReadCollection['findOne']>
  ): Promise<DocumentReadPersistanceModel | null> {
    return this.collection.findOne(...options);
  }

  async updateOne(...options: Parameters<DocumentReadCollection['updateOne']>) {
    await this.collection.updateOne(...options);
  }

  async insertOne(...options: Parameters<DocumentReadCollection['insertOne']>) {
    await this.collection.insertOne(...options);
  }
}
