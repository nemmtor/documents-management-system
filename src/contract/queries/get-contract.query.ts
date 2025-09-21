import { Query } from '@nestjs/cqrs';
import { ContractReadModel } from './contract.read-model';

export class GetContractQuery extends Query<ContractReadModel | undefined> {
  constructor(public readonly payload: { contractId: string }) {
    super();
  }
}
