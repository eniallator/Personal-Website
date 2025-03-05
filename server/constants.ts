import { guardOrThrow, isArrayOf } from "deep-guards";
import { readFileSync } from "fs";

import {
  DayOfYear,
  isCompany,
  isProject,
  SpecialTheme,
  Theme,
} from "./types.ts";

export const HOUR_IN_MS = 3.6e6;
export const DAYS_SPECIAL_THEME_IS_SHOWING = 7;
export const GITHUB_PAGE_SIZE = 100;

export const DEFAULT_THEME: Theme = "dark";
export const SPECIAL_THEMES: Record<
  Exclude<SpecialTheme, "no-theme">,
  DayOfYear
> = {
  halloween: { month: 9, day: 31 },
  christmas: { month: 11, day: 25 },
};

export const companies = guardOrThrow(
  JSON.parse(readFileSync("public/companies.json").toString()),
  isArrayOf(isCompany),
  "Invalid company format"
);

export const initialProjects = guardOrThrow(
  JSON.parse(readFileSync("public/projects.json").toString()),
  isArrayOf(isProject),
  "Invalid project format"
);
