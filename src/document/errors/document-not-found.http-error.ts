import { NotFoundException } from '@nestjs/common';

export class DocumentNotFoundHttpError extends NotFoundException {
  constructor(public readonly documentId: string) {
    super('Document not found');
  }
}
