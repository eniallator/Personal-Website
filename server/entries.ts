export type Entry<O extends object> = readonly [keyof O, O[keyof O]];

export const typedToEntries = <const O extends object>(obj: O): Entry<O>[] =>
  Object.entries(obj) as unknown as Entry<O>[];

export const typedFromEntries = <const O extends object>(
  entries: Entry<O>[]
): O => Object.fromEntries(entries) as O;

export const mapObject = <const I extends object, const O extends object>(
  obj: I,
  mapper: (entry: Entry<I>, index: number, array: Entry<I>[]) => Entry<O>
): O => typedFromEntries(typedToEntries(obj).map(mapper));
