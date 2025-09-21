import { NotFoundException } from '@nestjs/common';

export class AttachmentNotFoundHttpError extends NotFoundException {
  public readonly contractId: string;
  public readonly attachmentId: string;

  constructor(payload: { contractId: string; attachmentId: string }) {
    super('Attachment not found');
    this.contractId = payload.contractId;
    this.attachmentId = payload.attachmentId;
  }
}
