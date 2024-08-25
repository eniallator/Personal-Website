// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function raise<T = never>(err: Error): T {
  throw err;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}
