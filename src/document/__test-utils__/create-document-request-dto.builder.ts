import { DataBuilder } from '../../__test-utils__/data-builder';
import { CreateDocumentRequestDTOShape } from '../dto/create-document-request.dto';

export class CreateDocumentRequestDTOBuilder extends DataBuilder<CreateDocumentRequestDTOShape> {
  constructor() {
    super({
      content: '',
    });
  }

  public withContent(content: string) {
    return this.with({ content });
  }
}
