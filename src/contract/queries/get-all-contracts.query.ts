import { Query } from '@nestjs/cqrs';
import { ContractReadModel } from './contract.read-model';

export class GetAllContractsQuery extends Query<ContractReadModel[]> {}
