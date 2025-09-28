import { CustomError } from 'ts-custom-error';

export class DocumentNotFoundError extends CustomError {
  public override readonly name = 'DocumentNotFoundError';

  constructor(public readonly documentId: string) {
    super();
  }
}
