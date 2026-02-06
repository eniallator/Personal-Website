import { guardOrThrow, isArrayOf } from "deep-guards";

import rawCompanies from "../public/companies.json" with { type: "json" };
import rawProjects from "../public/projects.json" with { type: "json" };
import { isCompany, isProject } from "./types.js";

import type { DayOfYear, SpecialTheme, Theme } from "./types.js";

export const HOUR_IN_MS = 3.6e6;
export const DAYS_SPECIAL_THEME_IS_SHOWING = 7;
export const GITHUB_PAGE_SIZE = 100;

export const DEFAULT_THEME = "dark" satisfies Theme;
export const SPECIAL_THEMES: Record<
  Exclude<SpecialTheme, "no-theme">,
  DayOfYear
> = {
  halloween: { month: 9, day: 31 },
  christmas: { month: 11, day: 25 },
};

export const companies = guardOrThrow(
  rawCompanies,
  isArrayOf(isCompany),
  "Invalid company format",
);

export const initialProjects = guardOrThrow(
  rawProjects,
  isArrayOf(isProject),
  "Invalid project format",
);
