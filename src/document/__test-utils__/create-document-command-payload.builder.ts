import { DataBuilder } from '../../__test-utils__/data-builder';
import { CreateDocumentCommandPayload } from '../commands/create-document.command';

export class CreateDocumentCommandPayloadBuilder extends DataBuilder<CreateDocumentCommandPayload> {
  constructor() {
    super({
      content: '',
    });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
