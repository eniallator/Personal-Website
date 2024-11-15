import {
  DAYS_SPECIAL_THEME_IS_SHOWING,
  DEFAULT_SPECIAL_THEME,
  HOUR_IN_MS,
  SPECIAL_THEMES,
} from "./constants.js";

const halfMsThemeIsShowing = DAYS_SPECIAL_THEME_IS_SHOWING * 12 * HOUR_IN_MS;

export function calculateSpecialTheme(): string {
  const now = new Date();
  const nowTimestamp = now.getTime();

  const closest = Object.entries(SPECIAL_THEMES)
    .map(([theme, themeDate]) => {
      const diffs = [-1, 0, 1].map((yearOffset) => {
        const dateToCheck = new Date(
          now.getFullYear() + yearOffset,
          themeDate.month,
          themeDate.day,
          12
        );
        return Math.abs(nowTimestamp - dateToCheck.getTime());
      });
      return { theme, diff: Math.min(...diffs) };
    })
    .filter(({ diff }) => diff < halfMsThemeIsShowing)
    .sort((a, b) => a.diff - b.diff)[0];

  return closest?.theme ?? DEFAULT_SPECIAL_THEME;
}
