import { ConsoleLogger } from '@nestjs/common';

export class DocumentLogger extends ConsoleLogger {
  constructor() {
    super('DocumentModule');
  }
}
