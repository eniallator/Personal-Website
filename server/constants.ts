import {
  guardOrThrow,
  isArrayOf,
  isExact,
  isObjectOf,
  isString,
} from "deep-guards";
import { readFileSync } from "fs";

import { DayOfYear, isCompany } from "./types.js";
import { isEmail } from "./utils.js";

export const HOUR_IN_MS = 3.6e6;
export const DAYS_SPECIAL_THEME_IS_SHOWING = 7;
export const GITHUB_PAGE_SIZE = 100;

export const DEFAULT_THEME = "dark";
export const THEMES = ["dark", "light"];
export const DEFAULT_SPECIAL_THEME = "no-theme";
export const SPECIAL_THEMES: Record<string, DayOfYear> = {
  halloween: {
    month: 9,
    day: 31,
  },
  christmas: {
    month: 11,
    day: 25,
  },
};

export const companies = guardOrThrow(
  JSON.parse(readFileSync("public/companies.json").toString()),
  isArrayOf(isCompany),
  "Invalid company format"
);

export const mailGuard = isObjectOf(
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
