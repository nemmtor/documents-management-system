import { cloneDeep } from 'es-toolkit';

export abstract class DataBuilder<T> {
  private data: T;

  constructor(initialData: T) {
    this.data = initialData;
  }

  public build(): Readonly<T> {
    return cloneDeep(this.data);
  }

  protected with(partial: Partial<T>): this {
    this.data = { ...this.data, ...partial };
    return this;
  }
}
