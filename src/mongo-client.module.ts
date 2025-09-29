import {
  DynamicModule,
  InjectionToken,
  Module,
  ModuleMetadata,
  OnModuleDestroy,
} from '@nestjs/common';

import { Db, MongoClient } from 'mongodb';

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
  name: string;
};

class MongoDbProvider implements OnModuleDestroy {
  constructor(private readonly client: MongoClient) {}

  async onModuleDestroy() {
    await this.client.close();
  }

  getDb(): Db {
    return this.client.db();
  }
}

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Nestjs DI
export class MongoClientModule {
  static forFeatureAsync(opts: Options): DynamicModule {
    const providerToken = `${opts.name}_PROVIDER`;

    return {
      module: MongoClientModule,
      imports: opts.imports ?? [],
      providers: [
        {
          provide: providerToken,
          useFactory: async (...args: unknown[]) => {
            const config = await opts.useFactory(...args);
            const { host, name, password, port, user } = config;
            const client = await MongoClient.connect(
              `mongodb://${user}:${password}@${host}:${port}/${name}?directConnection=true`,
            );
            return new MongoDbProvider(client);
          },
          inject: opts.inject,
        },
        {
          provide: opts.name,
          useFactory: (provider: MongoDbProvider) => {
            return provider.getDb();
          },
          inject: [providerToken],
        },
      ],
      exports: [opts.name],
    };
  }
}
