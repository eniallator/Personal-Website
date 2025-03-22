export const tuple = <const T extends unknown[]>(...tuple: T): T => tuple;

export const positiveMod = (a: number, b: number): number => ((a % b) + b) % b;

export const formatDate = (date: Date) =>
  date.toISOString().replace(/z.*$/i, "");

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

export const findAndMap = <I, O>(
  arr: readonly I[],
  mapper: (val: I, index: number, arr: readonly I[]) => O | null | undefined
): O | null => {
  for (let i = 0; i < arr.length; i++) {
    const mapped = mapper(arr[i] as I, i, arr);
    if (mapped != null) return mapped;
  }
  return null;
};
