import {
  createDocumentConfigFrom,
  DocumentConfigSourceShape,
} from './document.config-factory';

describe('document config factory', () => {
  it('should register via document namespace', () => {
    const config = createDocumentConfigFrom(EMPTY_DOCUMENT_CONFIG_SOURCE);

    expect(config.KEY).toBe('CONFIGURATION(document)');
  });

  it('should map to db config', () => {
    const config = createDocumentConfigFrom({
      CONTRACT_SERVICE_QUEUE_NAME: 'CONTRACT_SERVICE_QUEUE_NAME',
      DOCUMENT_READ_DB_HOST: 'DOCUMENT_READ_DB_HOST',
      DOCUMENT_READ_DB_NAME: 'DOCUMENT_READ_DB_NAME',
      DOCUMENT_READ_DB_PASSWORD: 'DOCUMENT_READ_DB_PASSWORD',
      DOCUMENT_READ_DB_PORT: '1',
      DOCUMENT_READ_DB_USER: 'DOCUMENT_READ_DB_USER',
      DOCUMENT_WRITE_DB_HOST: 'DOCUMENT_WRITE_DB_HOST',
      DOCUMENT_WRITE_DB_NAME: 'DOCUMENT_WRITE_DB_NAME',
      DOCUMENT_WRITE_DB_PASSWORD: 'DOCUMENT_WRITE_DB_PASSWORD',
      DOCUMENT_WRITE_DB_PORT: '2',
      DOCUMENT_WRITE_DB_USER: 'DOCUMENT_WRITE_DB_USER',
      RABBIT_HOST: 'RABBIT_HOST',
      RABBIT_PASSWORD: 'RABBIT_PASSWORD',
      RABBIT_PORT: '3',
      RABBIT_USER: 'RABBIT_USER',
    });

    expect(config()).toEqual({
      contractServiceQueue: {
        name: 'CONTRACT_SERVICE_QUEUE_NAME',
        user: 'RABBIT_USER',
        password: 'RABBIT_PASSWORD',
        host: 'RABBIT_HOST',
        port: 3,
      },
      readDatabase: {
        name: 'DOCUMENT_READ_DB_NAME',
        user: 'DOCUMENT_READ_DB_USER',
        password: 'DOCUMENT_READ_DB_PASSWORD',
        host: 'DOCUMENT_READ_DB_HOST',
        port: 1,
      },
      writeDatabase: {
        name: 'DOCUMENT_WRITE_DB_NAME',
        user: 'DOCUMENT_WRITE_DB_USER',
        password: 'DOCUMENT_WRITE_DB_PASSWORD',
        host: 'DOCUMENT_WRITE_DB_HOST',
        port: 2,
      },
    });
  });

  it.each([
    'CONTRACT_SERVICE_QUEUE_NAME' as const,
    'DOCUMENT_READ_DB_HOST' as const,
    'DOCUMENT_READ_DB_NAME' as const,
    'DOCUMENT_READ_DB_PASSWORD' as const,
    'DOCUMENT_READ_DB_PORT' as const,
    'DOCUMENT_READ_DB_USER' as const,
    'DOCUMENT_WRITE_DB_HOST' as const,
    'DOCUMENT_WRITE_DB_NAME' as const,
    'DOCUMENT_WRITE_DB_PASSWORD' as const,
    'DOCUMENT_WRITE_DB_PORT' as const,
    'DOCUMENT_WRITE_DB_USER' as const,
    'RABBIT_HOST' as const,
    'RABBIT_PASSWORD' as const,
    'RABBIT_PORT' as const,
    'RABBIT_USER' as const,
  ])('should throw if %s is missing', (key) => {
    const { [key]: _, ...source } = EMPTY_DOCUMENT_CONFIG_SOURCE;
    const config = createDocumentConfigFrom(source);
    expect(() => config()).toThrow();
  });

  it.each([
    'DOCUMENT_WRITE_DB_PORT' as const,
    'DOCUMENT_READ_DB_PORT' as const,
    'RABBIT_PORT' as const,
  ])('should throw if %s is not a numeric string', (key) => {
    const source = { ...EMPTY_DOCUMENT_CONFIG_SOURCE, [key]: '' };
    const config = createDocumentConfigFrom(source);
    expect(() => config()).toThrow();
  });

  it.each([
    'DOCUMENT_WRITE_DB_PORT' as const,
    'DOCUMENT_READ_DB_PORT' as const,
    'RABBIT_PORT' as const,
  ])('should throw if %s is negative', (key) => {
    const source = { ...EMPTY_DOCUMENT_CONFIG_SOURCE, [key]: '-1' };
    const config = createDocumentConfigFrom(source);
    expect(() => config()).toThrow();
  });

  it.each([
    'DOCUMENT_WRITE_DB_PORT' as const,
    'DOCUMENT_READ_DB_PORT' as const,
    'RABBIT_PORT' as const,
  ])('should throw if %s is above 65535', (key) => {
    const source = { ...EMPTY_DOCUMENT_CONFIG_SOURCE, [key]: '65536' };
    const config = createDocumentConfigFrom(source);
    expect(() => config()).toThrow();
  });

  it('should not throw if everything is provided', () => {
    const config = createDocumentConfigFrom(EMPTY_DOCUMENT_CONFIG_SOURCE);

    expect(() => config()).not.toThrow();
  });
});

const EMPTY_DOCUMENT_CONFIG_SOURCE: DocumentConfigSourceShape = {
  CONTRACT_SERVICE_QUEUE_NAME: '',
  DOCUMENT_READ_DB_HOST: '',
  DOCUMENT_READ_DB_NAME: '',
  DOCUMENT_READ_DB_PASSWORD: '',
  DOCUMENT_READ_DB_PORT: '1',
  DOCUMENT_READ_DB_USER: '',
  DOCUMENT_WRITE_DB_HOST: '',
  DOCUMENT_WRITE_DB_NAME: '',
  DOCUMENT_WRITE_DB_PASSWORD: '',
  DOCUMENT_WRITE_DB_PORT: '1',
  DOCUMENT_WRITE_DB_USER: '',
  RABBIT_HOST: '',
  RABBIT_PASSWORD: '',
  RABBIT_PORT: '1',
  RABBIT_USER: '',
};
