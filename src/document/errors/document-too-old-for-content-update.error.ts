export class DocumentTooOldForContentUpdateError extends Error {
  constructor(public readonly documentId: string) {
    super();
  }
}
