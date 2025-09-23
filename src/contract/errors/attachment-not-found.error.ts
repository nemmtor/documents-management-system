import { CustomError } from 'ts-custom-error';

export class AttachmentNotFoundError extends CustomError {
  public readonly name = 'AttachmentNotFoundError';
  public readonly contractId: string;
  public readonly attachmentId: string;

  constructor(payload: { contractId: string; attachmentId: string }) {
    super();
    this.contractId = payload.contractId;
    this.attachmentId = payload.attachmentId;
  }
}
