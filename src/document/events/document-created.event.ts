export type DocumentCreatedEventPayload = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export class DocumentCreatedEvent {
  constructor(public readonly payload: DocumentCreatedEventPayload) {}
}
