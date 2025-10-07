import { DataBuilder } from '../../__test-utils__/data-builder';
import { DocumentWritePersistanceModel } from '../document-write.db-client';

export class DocumentWritePersistanceModelBuilder extends DataBuilder<DocumentWritePersistanceModel> {
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
