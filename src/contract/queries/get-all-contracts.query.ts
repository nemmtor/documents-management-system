import { Query } from '@nestjs/cqrs';

export type ContractReadModel = {
  id: string;
  isSigned: boolean;
  createdAt: string;
  updatedAt: string;
  // TODO: can readmodel return content of attachment? If yes how to retrieve it?
  attachments: ReadonlyArray<{ isSeen: boolean; id: string }>;
};
export type AllContractsReadModel = ContractReadModel[];

export class GetAllContractsQuery extends Query<AllContractsReadModel> {}
