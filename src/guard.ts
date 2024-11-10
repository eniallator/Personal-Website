import { isEqual, raise } from "./utils.js";

export type Guard<T> = (value: unknown) => value is T;

export type OptionalGuard<T> = Guard<T | undefined> & {
  type: "Optional";
};

export const isOptional = <T>(guard: Guard<T>): OptionalGuard<T> =>
  ((value) => value === undefined || guard(value)) as OptionalGuard<T>;

export const isUnknown: Guard<unknown> = (_value): _value is unknown => true;

export const isNumber: Guard<number> = (value) => typeof value === "number";

export const isInteger: Guard<number> = (value): value is number =>
  Number.isInteger(value);

export const isString: Guard<string> = (value) => typeof value === "string";

export const isFunction: Guard<() => unknown> = (
  value
): value is () => unknown => typeof value === "function";

export const isObject: Guard<Record<string, unknown>> = (
  value
): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export const isBoolean: Guard<boolean> = (value) =>
  value === true || value === false;

export function isNullable<T>(guard: Guard<T>): Guard<T | null | undefined> {
  return (value: unknown): value is T | null | undefined =>
    value == null || guard(value);
}

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isExact<const T>(expected: T): Guard<T> {
  return (value): value is T => isEqual(value, expected);
}

export function isOneOf<
  const T extends string | number | boolean | symbol | null | undefined,
>(...values: T[]): Guard<T> {
  return (value: unknown): value is T => values.includes(value as T);
}

export function isUnionOf<G extends Guard<unknown>[]>(
  ...guards: G
): Guard<G extends Guard<infer T>[] ? T : never> {
  return (value): value is G extends Guard<infer T>[] ? T : never =>
    guards.some((guard) => guard(value));
}

export function isArrayOf<T>(guard: Guard<T>): Guard<T[]> {
  return (value): value is T[] => Array.isArray(value) && value.every(guard);
}

export function isRecordOf<K extends string | number | symbol, V>(
  keyGuard: Guard<K>,
  valueGuard: Guard<V>
): Guard<Record<K, V>> {
  return (value): value is Record<K, V> =>
    isObject(value) &&
    Object.entries(value).every(
      ([key, value]) => keyGuard(key) && valueGuard(value)
    );
}

type Schema = {
  [S in string | number | symbol]: Guard<unknown> | OptionalGuard<unknown>;
};

type OptionalGuardKeys<S extends Schema> = {
  [K in keyof S]: S[K] extends OptionalGuard<unknown> ? K : never;
}[keyof S];

// Not extracting into a type so tooltips show the resultant object, not the guards
export function isObjectOf<S extends Schema>(
  schema: S
): Guard<
  Exclude<keyof S, OptionalGuardKeys<S>> extends never
    ? OptionalGuardKeys<S> extends never
      ? object
      : {
          [K in OptionalGuardKeys<S>]?: S[K] extends OptionalGuard<infer T>
            ? T
            : never;
        }
    : OptionalGuardKeys<S> extends never
      ? {
          [K in Exclude<keyof S, OptionalGuardKeys<S>>]: S[K] extends Guard<
            infer T
          >
            ? T
            : never;
        }
      : {
          [K in Exclude<keyof S, OptionalGuardKeys<S>>]: S[K] extends Guard<
            infer T
          >
            ? T
            : never;
        } & {
          [K in OptionalGuardKeys<S>]?: S[K] extends OptionalGuard<infer T>
            ? T
            : never;
        }
> {
  return ((value) =>
    isObject(value) &&
    Object.entries(schema).every(
      ([key, valueGuard]) =>
        key in value && (!isFunction(valueGuard) || valueGuard(value))
    )) as ReturnType<typeof isObjectOf<S>>;
}

export function guardOrThrow<T>(
  value: unknown,
  guard: Guard<T>,
  hint?: string
): T {
  return guard(value) ? value : raise<T>(new Error(hint ?? "Guard error"));
}

export function hasType<const S extends string>(name: S): Guard<{ type: S }> {
  return (value): value is { type: S } =>
    isObject(value) && "type" in value && value.type === name;
}
