import { AggregateRoot } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { DocumentContentUpdatedEvent } from './events/document-content-updated.event';

type DocumentAggregateEvents = DocumentContentUpdatedEvent;

export class DocumentAggregate extends AggregateRoot<DocumentAggregateEvents> {
  readonly id: string;
  readonly createdAt: Date;
  private _content: string;

  private readonly MAX_DOCUMENT_AGE_FOR_CONTENT_UPDATE = 1;

  public constructor(payload: {
    id: string;
    content: string;
    createdAt: Date;
  }) {
    super();
    this.id = payload.id;
    this._content = payload.content;
    this.createdAt = payload.createdAt;
  }

  public updateContent(newContent: string) {
    const now = new Date();
    const ageInMilliseconds = now.getTime() - this.createdAt.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365);

    if (ageInYears > this.MAX_DOCUMENT_AGE_FOR_CONTENT_UPDATE) {
      return err(new DocumentTooOldForContentUpdateError(this.id));
    }

    this._content = newContent;
    this.apply(new DocumentContentUpdatedEvent({ documentId: this.id }));
    return ok();
  }

  get content() {
    return this._content;
  }
}
