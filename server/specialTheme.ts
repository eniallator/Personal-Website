import {
  DAYS_SPECIAL_THEME_IS_SHOWING,
  HOUR_IN_MS,
  SPECIAL_THEMES,
} from "./constants.js";
import { SpecialTheme } from "./types.js";
import { typedToEntries } from "./utils.js";

const halfMsThemeIsShowing = DAYS_SPECIAL_THEME_IS_SHOWING * 12 * HOUR_IN_MS;

export function calculateSpecialTheme(): SpecialTheme {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowTimestamp = now.getTime();

  const closest = typedToEntries(SPECIAL_THEMES)
    .map(([theme, { month, day }]) => ({
      theme,
      diff: [-1, 0, 1].reduce((closest, yearOffset) => {
        const date = new Date(nowYear + yearOffset, month, day, 12);
        return Math.min(closest, Math.abs(nowTimestamp - date.getTime()));
      }, Infinity),
    }))
    .filter(({ diff }) => diff < halfMsThemeIsShowing)
    .sort((a, b) => a.diff - b.diff)[0];

  return closest?.theme ?? "no-theme";
}
