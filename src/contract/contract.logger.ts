/* istanbul ignore file */
import { ConsoleLogger } from '@nestjs/common';

export class ContractLogger extends ConsoleLogger {
  constructor() {
    super('ContractModule');
  }
}
