export class CannotSignContractWithUnseenAttachmentsError extends Error {
  public readonly contractId: string;

  constructor(payload: { contractId: string }) {
    super();
    this.contractId = payload.contractId;
  }
}
