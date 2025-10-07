import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from '@testcontainers/mongodb';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../http-exception.filter';
import { documentConfig } from './config/document.config';
import { DocumentModule } from './document.module';

describe('Document module2', () => {
  jest.setTimeout(60000);

  let app: INestApplication<App>;
  let readDbContainer: StartedMongoDBContainer;
  let writeDbContainer: StartedMongoDBContainer;

  beforeAll(async () => {
    const createMongoContainer = (opts: { port: number; name: string }) =>
      new MongoDBContainer('mongo:8')
        .withName(opts.name)
        .withExposedPorts({ container: 27017, host: opts.port })
        .withUsername('root')
        .withPassword('root')
        .withEnvironment({
          MONGO_INITDB_ROOT_USERNAME: 'root',
          MONGO_INITDB_ROOT_PASSWORD: 'root',
          DB_USER: 'user',
          DB_PASSWORD: 'password',
          DB_NAME: 'db',
        })
        .withCopyFilesToContainer([
          {
            source: path.join(process.cwd(), 'scripts/init-db.sh'),
            target: 'docker-entrypoint-initdb.d/init-mongo.sh',
          },
        ])
        .start();

    const [readDb, writeDb] = await Promise.all([
      createMongoContainer({ port: 27015, name: 'document-read-db' }),
      createMongoContainer({ port: 27016, name: 'document-write-db' }),
    ]);
    readDbContainer = readDb;
    writeDbContainer = writeDb;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DocumentModule],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ZodValidationPipe,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ZodSerializerInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
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
          name: 'db',
          user: 'user',
          password: 'password',
          host: readDbContainer.getHost(),
          port: readDbContainer.getFirstMappedPort(),
        },
        writeDatabase: {
          name: 'db',
          user: 'user',
          password: 'password',
          host: writeDbContainer.getHost(),
          port: writeDbContainer.getFirstMappedPort(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await readDbContainer.stop();
    await writeDbContainer.stop();
  });

  describe('get document by id', () => {
    it('should not fail with bad request exception if document id is valid a uuid', async () => {
      const res = await request(app.getHttpServer()).get(
        `/documents/${randomUUID()}`,
      );

      expect(res.status).not.toBe(400);
    });

    it('should fail with bad request exception if document id is not a uuid', () => {
      return request(app.getHttpServer()).get('/documents/1').expect(400);
    });
  });
});
