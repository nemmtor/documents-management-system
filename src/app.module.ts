/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ContractModule } from './contract/contract.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [DocumentModule, ContractModule],
})
export class AppModule {}
