import {
  DynamicModule,
  InjectionToken,
  Module,
  ModuleMetadata,
} from '@nestjs/common';

import { MongoClient } from 'mongodb';

type MongoClientModuleOptions = {
  host: string;
  name: string;
  port: number;
  user: string;
  password: string;
};

type Options = Pick<ModuleMetadata, 'imports'> & {
  useFactory: (
    ...args: unknown[]
  ) => Promise<MongoClientModuleOptions> | MongoClientModuleOptions;
  inject: InjectionToken[];
  name: string | symbol;
};

@Module({})
export class MongoClientModule {
  static forFeatureAsync(opts: Options): DynamicModule {
    return {
      module: MongoClientModule,
      imports: opts.imports ?? [],
      providers: [
        {
          provide: opts.name,
          useFactory: async (...args: unknown[]) => {
            const config = await opts.useFactory(...args);
            const { host, name, password, port, user } = config;
            const client = await MongoClient.connect(
              `mongodb://${user}:${password}@${host}:${port}/${name}`,
            );
            return client.db();
          },
          inject: opts.inject,
        },
      ],
      exports: [opts.name],
    };
  }
}
