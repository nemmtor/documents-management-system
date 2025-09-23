import { CustomError } from 'ts-custom-error';

export const assertNever = (value: never, message: string) => {
  throw new UnexpectedValueError(value, message);
};

export class UnexpectedValueError extends CustomError {
  constructor(
    readonly value: unknown,
    readonly message: string,
  ) {
    super(message);
  }
}
