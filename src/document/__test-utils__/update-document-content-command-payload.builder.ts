import { DataBuilder } from '../../__test-utils__/data-builder';
import { UpdateDocumentContentCommandPayload } from '../commands/update-document-content.command';

export class UpdateDocumentContentCommandPayloadBuilder extends DataBuilder<UpdateDocumentContentCommandPayload> {
  constructor() {
    super({
      documentId: '',
      content: '',
    });
  }

  public withDocumentId(documentId: string) {
    return this.with({ documentId });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
