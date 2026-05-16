// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgFn<Return = unknown> = (...args: any[]) => Return;

export const throttled = <Fn extends AnyArgFn>(
  fn: Fn,
  throttleMs: number,
  initial: ReturnType<Fn>,
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result = initial;

  return ((...args) => {
    const currTime = Date.now();
    if (lastRun + throttleMs < currTime) {
      result = fn(...(args as Parameters<Fn>)) as ReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};

type AsyncReturnType<Fn extends AnyArgFn<Promise<unknown>>> =
  Fn extends AnyArgFn<Promise<infer T>> ? T : never;

export const asyncThrottled = <Fn extends AnyArgFn<Promise<unknown>>>(
  fn: Fn,
  throttleMs: number,
  initial: AsyncReturnType<Fn>,
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result = initial;

  return (async (...args) => {
    const currTime = Date.now();
    if (lastRun + throttleMs < currTime) {
      result = (await fn(...(args as Parameters<Fn>))) as AsyncReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};
