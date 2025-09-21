export class AttachmentNotFoundError extends Error {
  public readonly contractId: string;
  public readonly attachmentId: string;

  constructor(payload: { contractId: string; attachmentId: string }) {
    super();
    this.contractId = payload.contractId;
    this.attachmentId = payload.attachmentId;
  }
}
