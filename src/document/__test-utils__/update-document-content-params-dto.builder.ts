import { DataBuilder } from '../../__test-utils__/data-builder';
import { UpdateDocumentContentParamsDTOShape } from '../dto/update-document-content-params.dto';

export class UpdateDocumentContentParamsDTOBuilder extends DataBuilder<UpdateDocumentContentParamsDTOShape> {
  constructor() {
    super({
      documentId: '',
    });
  }

  public withDocumentId(documentId: string) {
    return this.with({ documentId });
  }
}
