import { DataBuilder } from '../../__test-utils__/data-builder';
import { ReconstituteDocumentAggregatePayload } from '../document.aggregate';

export class ReconstituteDocumentAggregatePayloadBuilder extends DataBuilder<ReconstituteDocumentAggregatePayload> {
  constructor() {
    super({
      id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      content: '',
    });
  }

  public withId(id: string) {
    return this.with({ id });
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
