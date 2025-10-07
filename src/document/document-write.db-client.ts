import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { DOCUMENT_WRITE_DB } from './document.constants';

export type DocumentWritePersistanceModel = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
};

type DocumentWriteCollection = Collection<DocumentWritePersistanceModel>;

// TODO: write tests
@Injectable()
export class DocumentWriteDbClient {
  private readonly collection: DocumentWriteCollection;
  constructor(
    @Inject(DOCUMENT_WRITE_DB) private readonly documentDbClient: Db,
  ) {
    this.collection =
      this.documentDbClient.collection<DocumentWritePersistanceModel>(
        'document-write',
      );
  }

  async findOne(
    ...options: Parameters<DocumentWriteCollection['findOne']>
  ): Promise<DocumentWritePersistanceModel | null> {
    return this.collection.findOne(...options);
  }

  async updateOne(
    ...options: Parameters<DocumentWriteCollection['updateOne']>
  ) {
    await this.collection.updateOne(...options);
  }
}
