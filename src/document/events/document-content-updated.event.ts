export class DocumentContentUpdatedEvent {
  constructor(public readonly payload: { documentId: string }) {}
}
