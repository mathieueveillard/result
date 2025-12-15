import { ko, Result } from "./index.spec";

type MappingFunction<U, V, E, F> = (u: U) => Result<V, E | F> | Promise<Result<V, E | F>>;

type ErrorMappingFunction<U, E, F> = (e: E) => Result<U, F> | Promise<Result<U, F>>;

export type AsyncResult<U, E> = {
  readonly bind: <V, F>(fn: MappingFunction<U, V, E, F>) => AsyncResult<V, E | F>;
  readonly bindError: <F>(fn: ErrorMappingFunction<U, E, F>) => AsyncResult<U, F>;
  readonly get: () => Promise<Result<U, E>>;
};

export const asyncResult = <U, E>(promise: Promise<Result<U, E>>): AsyncResult<U, E> => ({
  bind: <V, F>(fn: MappingFunction<U, V, E, F>) => {
    const next = promise.then((r) => {
      if (r.type === "SUCCESS") {
        return fn(r.value);
      } else {
        return Promise.resolve(ko(r.error));
      }
    });
    return asyncResult(next);
  },
  bindError: <F>(fn: ErrorMappingFunction<U, E, F>) => {
    const next = promise.then((r) => {
      if (r.type === "ERROR") {
        return fn(r.error);
      } else {
        return r;
      }
    });
    return asyncResult(next);
  },
  get: () => promise,
});
