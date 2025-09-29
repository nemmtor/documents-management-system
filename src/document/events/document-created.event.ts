export class DocumentCreatedEvent {
  constructor(
    public readonly payload: {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {}
}
