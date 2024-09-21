// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function raise<T = never>(err: Error): T {
  throw err;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

// https://stackoverflow.com/a/9204568/11824244
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isEmail(
  email: string
): email is `${string}@${string}.${string}` {
  return emailRegex.test(email);
}
