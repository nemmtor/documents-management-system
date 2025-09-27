import { AssertNeverError, assertNever } from './assert-never';

describe('assertNever', () => {
  it('should throw AssertNeverError', () => {
    expect(() => assertNever(undefined as never, 'msg')).toThrow(
      AssertNeverError,
    );
  });
});
