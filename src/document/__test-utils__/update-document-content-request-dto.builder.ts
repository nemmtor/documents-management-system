import { DataBuilder } from '../../__test-utils__/data-builder';
import { UpdateDocumentContentRequestDTOShape } from '../dto/update-document-content-request.dto';

export class UpdateDocumentContentRequestDTOBuilder extends DataBuilder<UpdateDocumentContentRequestDTOShape> {
  constructor() {
    super({
      content: '',
    });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
