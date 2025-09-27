import { CustomError } from 'ts-custom-error';

export const assertNever = (value: never, message: string) => {
  throw new AssertNeverError(value, message);
};

export class AssertNeverError extends CustomError {
  constructor(
    readonly value: unknown,
    readonly message: string,
  ) {
    super(message);
  }
}
