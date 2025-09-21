import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ContractDb } from '../contract.db';
import { ContractReadModel } from './contract.read-model';
import { GetAllContractsQuery } from './get-all-contracts.query';

@QueryHandler(GetAllContractsQuery)
export class GetAllContractsQueryHandler
  implements IQueryHandler<GetAllContractsQuery>
{
  constructor(private readonly contractDb: ContractDb) {}

  async execute(_query: GetAllContractsQuery) {
    const contracts = await this.contractDb.getAll();

    return contracts.map((foundContract) => {
      // TODO: is it ok that it is reusing readmodel or should it be a separate one?
      const readModel: ContractReadModel = {
        id: foundContract.id,
        createdAt: foundContract.createdAt,
        updatedAt: foundContract.updatedAt,
        attachments: foundContract.attachments,
        isSigned: foundContract.isSigned,
      };

      return readModel;
    });
  }
}
