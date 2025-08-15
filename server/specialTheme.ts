import {
  DAYS_SPECIAL_THEME_IS_SHOWING,
  HOUR_IN_MS,
  SPECIAL_THEMES,
} from "./constants.js";
import { typedToEntries } from "./entries.js";

import type { SpecialTheme } from "./types.js";

const halfMsThemeIsShowing = DAYS_SPECIAL_THEME_IS_SHOWING * 12 * HOUR_IN_MS;

export const calculateSpecialTheme = (): SpecialTheme => {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowTimestamp = now.getTime();

  const [closest] = typedToEntries(SPECIAL_THEMES)
    .map(([theme, { month, day, hour = 12 }]) => ({
      diff: [-1, 0, 1].reduce((closest, yearOffset) => {
        const date = new Date(nowYear + yearOffset, month, day, hour);
        return Math.min(closest, Math.abs(nowTimestamp - date.getTime()));
      }, Infinity),
      theme,
    }))
    .filter(({ diff }) => diff < halfMsThemeIsShowing)
    .sort((a, b) => a.diff - b.diff);

  return closest?.theme ?? "no-theme";
};
