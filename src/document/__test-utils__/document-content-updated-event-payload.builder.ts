import { DataBuilder } from '../../__test-utils__/data-builder';
import { DocumentContentUpdatedEventPayload } from '../events/document-content-updated.event';

export class DocumentContentUpdatedEventPayloadBuilder extends DataBuilder<DocumentContentUpdatedEventPayload> {
  constructor() {
    super({
      documentId: '',
      updatedAt: new Date(),
      content: '',
    });
  }

  public withDocumentId(documentId: string) {
    return this.with({ documentId });
  }

  public withUpdatedAt(updatedAt: Date) {
    return this.with({ updatedAt });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
