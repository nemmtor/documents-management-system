import { randomUUID } from 'node:crypto';
import { AggregateRoot } from '@nestjs/cqrs';
import { intervalToDuration } from 'date-fns';
import { sum } from 'es-toolkit';
import { err, ok } from 'neverthrow';
import { DocumentTooOldForContentUpdateError } from './errors/document-too-old-for-content-update.error';
import { DocumentContentUpdatedEvent } from './events/document-content-updated.event';
import { DocumentCreatedEvent } from './events/document-created.event';

type DocumentAggregateEvents =
  | DocumentCreatedEvent
  | DocumentContentUpdatedEvent;

type DocumentAggregateConstructorPayload = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDocumentAggregatePayload = Pick<
  DocumentAggregateConstructorPayload,
  'content'
>;

export type ReconstituteDocumentAggregatePayload =
  DocumentAggregateConstructorPayload;

export class DocumentAggregate extends AggregateRoot<DocumentAggregateEvents> {
  readonly id: string;
  readonly createdAt: Date;
  private _updatedAt: Date;
  private _content: string;

  private readonly MAX_DOCUMENT_AGE_FOR_CONTENT_UPDATE = 1;

  private constructor(payload: DocumentAggregateConstructorPayload) {
    super();
    this.id = payload.id;
    this._content = payload.content;
    this.createdAt = payload.createdAt;
    this._updatedAt = payload.updatedAt;
  }

  static create(payload: CreateDocumentAggregatePayload): DocumentAggregate {
    const createdAt = new Date();
    const documentAggregate = new DocumentAggregate({
      id: randomUUID(),
      createdAt,
      updatedAt: createdAt,
      content: payload.content,
    });

    documentAggregate.apply(
      new DocumentCreatedEvent({
        id: documentAggregate.id,
        content: documentAggregate.content,
        createdAt: documentAggregate.createdAt,
        updatedAt: documentAggregate.updatedAt,
      }),
    );

    return documentAggregate;
  }

  static reconstitute(
    props: ReconstituteDocumentAggregatePayload,
  ): DocumentAggregate {
    return new DocumentAggregate(props);
  }

  public updateContent(newContent: string) {
    const now = new Date();
    const { years: yearsPassed = 0, ...restOfDuration } = intervalToDuration({
      start: this.createdAt,
      end: now,
    });

    const isSlightlyOlderThanMaxAge =
      yearsPassed === this.MAX_DOCUMENT_AGE_FOR_CONTENT_UPDATE &&
      sum(Object.values(restOfDuration));

    if (isSlightlyOlderThanMaxAge) {
      return err(new DocumentTooOldForContentUpdateError(this.id));
    }

    if (yearsPassed > this.MAX_DOCUMENT_AGE_FOR_CONTENT_UPDATE) {
      return err(new DocumentTooOldForContentUpdateError(this.id));
    }

    this._content = newContent;
    this._updatedAt = now;
    this.apply(
      new DocumentContentUpdatedEvent({
        documentId: this.id,
        content: this._content,
        updatedAt: this._updatedAt,
      }),
    );
    return ok();
  }

  get content() {
    return this._content;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}
