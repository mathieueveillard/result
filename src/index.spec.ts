// --------------- app.ts ---------------
type DivisionByZeroError = "Division by 0.";

const divide = (a: number, b: number): Result<number, DivisionByZeroError> => {
  if (b === 0) {
    return ko("Division by 0.");
  }
  return ok(a / b);
};

const square = (n: number): Result<number, never> => ok(n ** 2);

divide(1, 2).bind(square); // ok(0.25)
divide(1, 0).bind(square); // ko("Division by 0.")

// ----------- utils/result.ts -----------

type MappingFunction<U, V, F> = (u: U) => Result<V, F>;

type OnSuccess<U> = (u: U) => void;

type OnError<E> = (e: E) => void;

type AbstractResult<Type, U, E> = {
  readonly type: Type;
  readonly bind: <V, F>(fn: MappingFunction<U, V, F>) => Result<V, E | F>;
  readonly finally: (onSuccess: OnSuccess<U>, onError: OnError<E>) => void;
};

export type Ok<U> = AbstractResult<"SUCCESS", U, never> & { readonly value: U };

export type Ko<E> = AbstractResult<"ERROR", never, E> & { readonly error: E };

export type Result<U, E> = Ok<U> | Ko<E>;

export const ok = <U>(value: U): Ok<U> => ({
  type: "SUCCESS",
  value,
  bind: <V, F>(fn: MappingFunction<U, V, F>) => fn(value),
  finally: (onSuccess) => {
    onSuccess(value);
  },
});

export const ko = <E>(error: E): Ko<E> => ({
  type: "ERROR",
  error,
  bind: () => ko<E>(error),
  finally: (_, onError) => {
    onError(error);
  },
});

// --------------- Tests ---------------

test("it should fail in case the user tries to divide by 0", () => {
  const actual = divide(1, 0);
  expect((actual as Ko<"Division by 0.">).error).toEqual("Division by 0.");
});

test("it should proceed to actual operation otherwise", () => {
  const actual = divide(1, 2);
  expect((actual as Ok<number>).value).toEqual(0.5);
});
