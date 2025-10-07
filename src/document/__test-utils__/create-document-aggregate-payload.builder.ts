import { DataBuilder } from '../../__test-utils__/data-builder';
import { CreateDocumentAggregatePayload } from '../document.aggregate';

export class CreateDocumentAggregatePayloadBuilder extends DataBuilder<CreateDocumentAggregatePayload> {
  constructor() {
    super({
      content: '',
    });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
