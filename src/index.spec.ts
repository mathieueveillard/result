type MappingFunction<U, V> = (u: U) => Result<V>;

type AbstractResult<Type, U> = {
  readonly type: Type;
  readonly bind: <V>(fn: MappingFunction<U, V>) => Result<V>;
  readonly finally: (onSuccess: (u: U) => void, onError: (error: string) => void) => void;
};

export type Ok<U> = AbstractResult<"SUCCESS", U> & { readonly value: U };

export type Ko<U> = AbstractResult<"ERROR", U> & { readonly error: string };

export type Result<U> = Ok<U> | Ko<U>;

export const ok = <U>(value: U): Ok<U> => ({
  type: "SUCCESS",
  value,
  bind: <V>(fn: MappingFunction<U, V>) => fn(value),
  finally: (onSuccess) => {
    onSuccess(value);
  },
});

export const ko = <U>(e: string): Ko<U> => ({
  type: "ERROR",
  error: e,
  bind: <V>() => ko<V>(e),
  finally: (_, onError) => {
    onError(e);
  },
});

// const divide = (a: number, b: number): number => {
//   if (b === 0) {
//     throw Error("Division by 0.");
//   }
//   return a / b;
// };

const divide = (a: number, b: number): Result<number> => {
  if (b === 0) {
    return ko("Division by 0.");
  }
  return ok(a / b);
};

const square = (n: number): Ok<number> => ok(n ** 2);

divide(1, 2).bind(square); // ok(0.25)
divide(1, 0).bind(square); // ko("Division by 0.")

test("it should fail in case the user tries to divide by 0", () => {
  const actual = divide(1, 0);
  expect((actual as Ko<number>).error).toEqual("Division by 0.");
});

test("it should proceed to actual operation otherwise", () => {
  const actual = divide(1, 2);
  expect((actual as Ok<number>).value).toEqual(0.5);
});
