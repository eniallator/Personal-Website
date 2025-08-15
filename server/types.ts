import { isExact, isNumber, isObjectOf, isOneOf, isString } from "deep-guards";

import type { Guard, TypeFromGuard } from "deep-guards";

export interface DayOfYear {
  month: number;
  day: number;
  hour?: number;
}

export const isTheme = isOneOf("dark", "light");
export type Theme = TypeFromGuard<typeof isTheme>;

export const isSpecialTheme = isOneOf("halloween", "christmas", "no-theme");
export type SpecialTheme = TypeFromGuard<typeof isSpecialTheme>;

export const isProject = isObjectOf({
  title: isString,
  description: isString,
  img: isString,
  github: isString,
});
export type Project = TypeFromGuard<typeof isProject>;

export const isCompany = isObjectOf({
  url: isString,
  name: isString,
  img: isString,
  aspectRatio: isNumber,
});
export type Company = TypeFromGuard<typeof isCompany>;

// https://stackoverflow.com/a/9204568/11824244
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail: Guard<`${string}@${string}.${string}`> = (
  value: unknown
): value is `${string}@${string}.${string}` =>
  typeof value === "string" && emailRegex.test(value);

export const isValidMail = isObjectOf(
  {
    phone: isExact("", false),
    city: isExact("", false),
    address: isExact("", false),
    country: isExact("", false),
    ["zip code"]: isExact("", false),
    name: isString,
    email: isEmail,
    message: isString,
  },
  true
);
