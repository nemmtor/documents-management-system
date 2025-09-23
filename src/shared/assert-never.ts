export const assertNever = (value: never, message: string) => {
  throw new UnexpectedValueError(value, message);
};

export class UnexpectedValueError extends Error {
  constructor(
    readonly value: unknown,
    readonly message: string,
  ) {
    super(message);
  }
}
