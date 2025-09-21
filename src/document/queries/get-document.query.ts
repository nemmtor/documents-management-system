import { Query } from '@nestjs/cqrs';

export type DocumentReadModel = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export class GetDocumentQuery extends Query<DocumentReadModel | undefined> {
  constructor(public readonly payload: { documentId: string }) {
    super();
  }
}
