import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ContractDb } from '../contract.db';
import { ContractReadModel } from './contract.read-model';
import { GetContractQuery } from './get-contract.query';

@QueryHandler(GetContractQuery)
export class GetContractQueryHandler
  implements IQueryHandler<GetContractQuery>
{
  constructor(private readonly contractDb: ContractDb) {}

  async execute(query: GetContractQuery) {
    const foundContract = await this.contractDb.find(query.payload.contractId);

    if (!foundContract) {
      return undefined;
    }

    const readModel: ContractReadModel = {
      id: foundContract.id,
      createdAt: foundContract.createdAt,
      updatedAt: foundContract.updatedAt,
      attachments: foundContract.attachments,
      isSigned: foundContract.isSigned,
    };

    return readModel;
  }
}
