import { DataBuilder } from '../../__test-utils__/data-builder';
import { DocumentReadModel } from '../queries/get-document.query';

export class DocumentReadModelBuilder extends DataBuilder<DocumentReadModel> {
  constructor() {
    super({
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: '',
    });
  }

  public withId(id: string) {
    return this.with({ id: id });
  }

  public withCreatedAt(createdAt: string) {
    return this.with({ createdAt });
  }

  public withUpdatedAt(updatedAt: string) {
    return this.with({ updatedAt });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
