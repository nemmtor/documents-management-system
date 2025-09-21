export class CannotUnseeAttachmentOfSignedContract extends Error {
  constructor(public readonly contractId: string) {
    super();
  }
}
