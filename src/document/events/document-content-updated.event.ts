export type DocumentContentUpdatedEventPayload = {
  documentId: string;
  content: string;
  updatedAt: Date;
};

export class DocumentContentUpdatedEvent {
  constructor(public readonly payload: DocumentContentUpdatedEventPayload) {}
}
