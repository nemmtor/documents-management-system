import { registerAs } from '@nestjs/config';
import { z } from 'zod';

type ContractServiceQueueConfigShape = {
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
};

type DocumentDatabaseConfigShape = {
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
};

type DocumentConfigShape = {
  contractServiceQueue: ContractServiceQueueConfigShape;
  readDatabase: DocumentDatabaseConfigShape;
  writeDatabase: DocumentDatabaseConfigShape;
};

const documentEnvVarsSchema = z.object({
  CONTRACT_SERVICE_QUEUE_NAME: z.string(),

  RABBIT_USER: z.string(),
  RABBIT_PASSWORD: z.string(),
  RABBIT_HOST: z.string(),
  RABBIT_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0).max(65535)),

  DOCUMENT_WRITE_DB_NAME: z.string(),
  DOCUMENT_WRITE_DB_USER: z.string(),
  DOCUMENT_WRITE_DB_PASSWORD: z.string(),
  DOCUMENT_WRITE_DB_HOST: z.string(),
  DOCUMENT_WRITE_DB_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0).max(65535)),

  DOCUMENT_READ_DB_NAME: z.string(),
  DOCUMENT_READ_DB_USER: z.string(),
  DOCUMENT_READ_DB_PASSWORD: z.string(),
  DOCUMENT_READ_DB_HOST: z.string(),
  DOCUMENT_READ_DB_PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().min(0).max(65535)),
});

export type DocumentConfigSourceShape = z.input<typeof documentEnvVarsSchema>;

export const createDocumentConfigFrom = (source: unknown) =>
  registerAs<DocumentConfigShape>('document', (): DocumentConfigShape => {
    const documentEnvVars = documentEnvVarsSchema.parse(source);

    return {
      contractServiceQueue: {
        name: documentEnvVars.CONTRACT_SERVICE_QUEUE_NAME,
        user: documentEnvVars.RABBIT_USER,
        password: documentEnvVars.RABBIT_PASSWORD,
        host: documentEnvVars.RABBIT_HOST,
        port: documentEnvVars.RABBIT_PORT,
      },
      readDatabase: {
        name: documentEnvVars.DOCUMENT_READ_DB_NAME,
        user: documentEnvVars.DOCUMENT_READ_DB_USER,
        password: documentEnvVars.DOCUMENT_READ_DB_PASSWORD,
        host: documentEnvVars.DOCUMENT_READ_DB_HOST,
        port: documentEnvVars.DOCUMENT_READ_DB_PORT,
      },
      writeDatabase: {
        name: documentEnvVars.DOCUMENT_WRITE_DB_NAME,
        user: documentEnvVars.DOCUMENT_WRITE_DB_USER,
        password: documentEnvVars.DOCUMENT_WRITE_DB_PASSWORD,
        host: documentEnvVars.DOCUMENT_WRITE_DB_HOST,
        port: documentEnvVars.DOCUMENT_WRITE_DB_PORT,
      },
    };
  });
