// TODO: write better tests overall in this file
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { documentConfig } from './document/document.config';
import {
  DOCUMENT_READ_DB,
  DOCUMENT_WRITE_DB,
} from './document/document.constants';
import { DocumentReadDbClient } from './document/document-read.db-client';
import { DocumentWriteDbClient } from './document/document-write.db-client';

describe('ContractController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(documentConfig.KEY)
      .useValue({
        contractServiceQueue: {
          name: 'test',
          user: 'test',
          password: 'test',
          host: 'localhost',
          port: 6000,
        },
        readDatabase: {
          name: 'test',
          user: 'test',
          password: 'test',
          host: 'test',
          port: 'test',
        },
        writeDatabase: {
          name: 'test',
          user: 'test',
          password: 'test',
          host: 'test',
          port: 'test',
        },
      })

      .overrideProvider(DOCUMENT_READ_DB)
      .useValue(jest.fn())
      .overrideProvider(DocumentReadDbClient)
      .useValue(jest.fn())
      .overrideProvider(DOCUMENT_WRITE_DB)
      .useValue(jest.fn())
      .overrideProvider(DocumentWriteDbClient)
      .useValue(jest.fn())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/contracts (GET)', () => {
    return request(app.getHttpServer())
      .get('/contracts')
      .expect(200)
      .expect([]);
  });
});
