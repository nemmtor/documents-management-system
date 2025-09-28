import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

type ContractServiceQueueConfig = {
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
};

type DocumentConfigShape = {
  contractServiceQueue: ContractServiceQueueConfig;
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
});

export const documentConfig = registerAs<DocumentConfigShape>(
  'document',
  (): DocumentConfigShape => {
    const documentEnvVars = documentEnvVarsSchema.parse(process.env);

    return {
      contractServiceQueue: {
        name: documentEnvVars.CONTRACT_SERVICE_QUEUE_NAME,
        user: documentEnvVars.RABBIT_USER,
        password: documentEnvVars.RABBIT_PASSWORD,
        host: documentEnvVars.RABBIT_HOST,
        port: documentEnvVars.RABBIT_PORT,
      },
    };
  },
);
export type DocumentConfig = ConfigType<typeof documentConfig>;
