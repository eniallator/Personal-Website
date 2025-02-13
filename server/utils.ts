export const raise = (err: Error): never => {
  throw err;
};

export const checkExhausted = (value: never): never => {
  throw new Error(`Value not exhausted: ${JSON.stringify(value)}`);
};

export const filterAndMap = <I, O>(
  arr: readonly I[],
  mapper: (val: I, index: number, arr: readonly I[]) => O | null | undefined
): O[] =>
  arr.reduce((acc: O[], item, i, arr) => {
    const mapped = mapper(item, i, arr);
    return mapped != null ? [...acc, mapped] : acc;
  }, []);

export const iterable = <T>(fn: () => T): Iterable<T> =>
  (function* () {
    yield fn();
  })();

export const findAndMap = <I, O>(
  arr: readonly I[],
  mapper: (val: I, index: number, arr: readonly I[]) => O | null | undefined
): O | null => {
  for (let i = 0; i < arr.length; i++) {
    const output = mapper(arr[i] as I, i, arr);

    if (output != null) {
      return output;
    }
  }
  return null;
};

export const formatDate = (date: Date): string =>
  date
    .toLocaleString()
    .replace(
      /(?<d>\d+)\/(?<m>\d+)\/(?<y>\d+)[^\d]*(?<t>\d+:\d+).*/,
      "$<y>-$<m>-$<d>T$<t>"
    );

export const tuple = <const T extends unknown[]>(...tuple: T): T => tuple;

export type Entry<O, K extends keyof O = keyof O> = readonly [K, O[K]];

export const typedToEntries = <O extends object>(obj: O): Entry<O>[] =>
  Object.entries(obj) as unknown as Entry<O>[];

export const typedFromEntries = <O extends object>(entries: Entry<O>[]): O =>
  Object.fromEntries(entries) as O;

export const mapObject = <const O extends object, const N extends object>(
  obj: O,
  mapper: (entry: Entry<O>) => Entry<N>
): N => typedFromEntries(typedToEntries(obj).map(mapper));

export const posMod = (a: number, b: number): number => ((a % b) + b) % b;
