export const tuple = <const T extends readonly unknown[]>(...tuple: T): T =>
  tuple;

export const raise = (err: Error): never => {
  throw err;
};

export const checkExhausted = (value: never): never =>
  raise(new Error(`Value not exhausted: ${JSON.stringify(value)}`));
