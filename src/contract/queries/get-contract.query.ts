import { Query } from '@nestjs/cqrs';

export type ContractReadModel = {
  id: string;
  isSigned: boolean;
  createdAt: string;
  updatedAt: string;
  // TODO: can readmodel return content of attachment? If yes how to retrieve it?
  attachments: Array<{ isSeen: boolean; id: string }>;
};

export class GetContractQuery extends Query<ContractReadModel | undefined> {
  constructor(public readonly payload: { contractId: string }) {
    super();
  }
}
