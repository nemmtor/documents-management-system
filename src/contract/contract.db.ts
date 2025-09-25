/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import type { ContractModel } from './contract.model';

// TODO: replace with real db
@Injectable()
export class ContractDb {
  private data: ContractModel[] = [];

  async getAll() {
    return this.data;
  }

  async insertOrUpdate(contract: ContractModel) {
    const existingIndex = this.data.findIndex((doc) => doc.id === contract.id);

    if (existingIndex !== -1) {
      const updatedContract: ContractModel = {
        ...contract,
        createdAt: this.data[existingIndex].createdAt,
      };
      this.data[existingIndex] = updatedContract;
      return;
    }

    const newContract: ContractModel = {
      ...contract,
      createdAt: contract.createdAt,
    };

    this.data.push(newContract);
  }

  async find(id: string) {
    return this.data.find((d) => d.id === id);
  }
}
