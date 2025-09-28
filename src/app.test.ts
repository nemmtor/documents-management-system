import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';
import { documentConfig } from './document/document.config';

describe('AppController (e2e)', () => {
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
      })
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
