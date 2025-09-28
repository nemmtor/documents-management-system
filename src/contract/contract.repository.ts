import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import { Attachment } from './attachment.vo';
import { ContractAggregate } from './contract.aggregate';
import { ContractDb } from './contract.db';
import { ContractModel } from './contract.model';
import { ContractNotFoundError } from './errors/contract-not-found.error';

@Injectable()
export class ContractRepository {
  constructor(private readonly contractDb: ContractDb) {}

  async getById(id: string) {
    const foundContract = await this.contractDb.find(id);

    if (!foundContract) {
      return err(new ContractNotFoundError(id));
    }

    return ok(this.toEntity(foundContract));
  }

  async findAllUnsignedIds() {
    const contracts = await this.contractDb.getAll();
    return contracts.filter((contract) => contract.isSigned === false);
  }

  async persist(contract: ContractAggregate) {
    const contractPersistanceObject = this.toPersistance(contract);
    await this.contractDb.insertOrUpdate(contractPersistanceObject);
  }

  private toEntity(contract: ContractModel): ContractAggregate {
    return new ContractAggregate({
      id: contract.id,
      createdAt: new Date(contract.createdAt),
      attachments: contract.attachments.map(
        (attachment) =>
          new Attachment({ id: attachment.id, isSeen: attachment.isSeen }),
      ),
      isSigned: contract.isSigned,
    });
  }

  private toPersistance(contract: ContractAggregate): ContractModel {
    return {
      id: contract.id,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: contract.attachments.map((attachment) => ({
        id: attachment.id,
        isSeen: attachment.isSeen,
      })),
      isSigned: contract.isSigned,
    };
  }
}
