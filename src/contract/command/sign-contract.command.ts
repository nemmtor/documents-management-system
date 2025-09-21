import { Command } from '@nestjs/cqrs';

export class SignContractCommand extends Command<void> {
  constructor(public readonly payload: { contractId: string }) {
    super();
  }
}
