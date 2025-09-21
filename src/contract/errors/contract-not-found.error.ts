export class ContractNotFoundError extends Error {
  constructor(public readonly contractId: string) {
    super();
  }
}
