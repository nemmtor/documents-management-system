import { CustomError } from 'ts-custom-error';

export class DocumentTooOldForContentUpdateError extends CustomError {
  public override readonly name = 'DocumentTooOldForContentUpdateError';

  constructor(public readonly documentId: string) {
    super();
  }
}
