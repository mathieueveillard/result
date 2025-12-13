import { ko, Result } from "./index.spec";

type MappingFunction<U, V> = (u: U) => Result<V> | Promise<Result<V>>;

type ErrorMappingFunction<U> = (e: string) => Result<U> | Promise<Result<U>>;

export type AsyncResult<U> = {
  readonly bind: <V>(fn: MappingFunction<U, V>) => AsyncResult<V>;
  readonly bindError: (fn: ErrorMappingFunction<U>) => AsyncResult<U>;
  readonly get: () => Promise<Result<U>>;
};

export const asyncResult = <U>(promise: Promise<Result<U>>): AsyncResult<U> => ({
  bind: <V>(fn: MappingFunction<U, V>) => {
    const next = promise.then<Result<V>, Result<V>>((r) => {
      if (r.type === "SUCCESS") {
        return fn(r.value);
      } else {
        return Promise.resolve(ko(r.error));
      }
    });
    return asyncResult(next);
  },
  bindError: (fn) => {
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
