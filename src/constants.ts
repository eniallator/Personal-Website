import { readFileSync } from "fs";

import { Company, DayOfYear } from "./types.js";

export const HOUR_IN_MS = 3.6e6;
export const DAYS_SPECIAL_THEME_IS_SHOWING = 7;

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

export const companies = JSON.parse(
  readFileSync("public/companies.json").toString()
) as Company[];

export const HONEY_POT_FIELDS = [
  "phone",
  "city",
  "address",
  "country",
  "zip code",
] as const;

export const DATA_FIELDS = ["name", "email", "message"] as const;

export const ALL_FIELDS: Set<string> = new Set([
  ...HONEY_POT_FIELDS,
  ...DATA_FIELDS,
]);
