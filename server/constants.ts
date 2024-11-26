import { readFileSync } from "fs";

import { guardOrThrow, isArrayOf } from "deep-guards";
import { DayOfYear, isCompany } from "./types.js";

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

export const HONEY_POT_FIELDS = [
  "phone",
  "city",
  "address",
  "country",
  "zip code",
] as const;

export const DATA_FIELDS = ["name", "email", "message"] as const;

export const ALL_FIELDS = new Set<string>([
  ...HONEY_POT_FIELDS,
  ...DATA_FIELDS,
]);
