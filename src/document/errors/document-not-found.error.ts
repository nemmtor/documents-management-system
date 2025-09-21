export class DocumentNotFoundError extends Error {
  constructor(public readonly documentId: string) {
    super();
  }
}
