import { DataBuilder } from '../../__test-utils__/data-builder';
import { DocumentReadPersistanceModel } from '../document-read.db-client';

export class DocumentReadPersistanceModelBuilder extends DataBuilder<DocumentReadPersistanceModel> {
  constructor() {
    super({
      _id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: '',
    });
  }

  public withId(id: string) {
    return this.with({ _id: id });
  }

  public withCreatedAt(createdAt: Date) {
    return this.with({ createdAt });
  }

  public withUpdatedAt(updatedAt: Date) {
    return this.with({ updatedAt });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
