import { ConfigType } from '@nestjs/config';
import { createDocumentConfigFrom } from './document.config-factory';

export const documentConfig = createDocumentConfigFrom(process.env);

export type DocumentConfig = ConfigType<typeof documentConfig>;
