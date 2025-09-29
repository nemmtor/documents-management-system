import { DataBuilder } from '../../__test-utils__/data-builder';
import { GetDocumentQueryPayload } from '../queries/get-document.query';

export class GetDocumentQueryPayloadBuilder extends DataBuilder<GetDocumentQueryPayload> {
  constructor() {
    super({
      documentId: '',
    });
  }

  public withDocumentId(documentId: string) {
    return this.with({ documentId });
  }
}
