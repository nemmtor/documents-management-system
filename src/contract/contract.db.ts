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
      const updatedDocument: ContractModel = {
        ...contract,
        createdAt: this.data[existingIndex].createdAt,
      };
      this.data[existingIndex] = updatedDocument;
      return;
    }

    const newDocument: ContractModel = {
      ...contract,
      createdAt: contract.createdAt,
    };

    this.data.push(newDocument);
  }

  async find(id: string) {
    return this.data.find((d) => d.id === id);
  }
}
