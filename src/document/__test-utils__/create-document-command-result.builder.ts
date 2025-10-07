import { DataBuilder } from '../../__test-utils__/data-builder';
import { CreateDocumentCommandResult } from '../commands/create-document.command';

export class CreateDocumentCommandResultBuilder extends DataBuilder<CreateDocumentCommandResult> {
  constructor() {
    super({
      documentId: '',
    });
  }

  public withDocumentId(documentId: string) {
    return this.with({ documentId });
  }
}
