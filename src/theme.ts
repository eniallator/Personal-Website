import { DAYS_THEME_IS_SHOWING, HOUR_IN_MS, THEMES } from "./constants.js";

const halfMsThemeIsShowing = DAYS_THEME_IS_SHOWING * 12 * HOUR_IN_MS;

export function calculateCurrentTheme() {
  const currDate = new Date();
  for (const [theme, themeCfg] of Object.entries(THEMES)) {
    let msToTheme;
    for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
      const themeDate = new Date(
        currDate.getFullYear() + yearOffset,
        themeCfg.month,
        themeCfg.day,
        12
      );
      const currMsToTheme = Math.abs(themeDate.getTime() - currDate.getTime());
      if (msToTheme === undefined || currMsToTheme < msToTheme) {
        msToTheme = currMsToTheme;
      }
    }

    if (msToTheme != null && msToTheme < halfMsThemeIsShowing) {
      console.log(`Current theme: ${theme}`);
      return theme;
    }
  }
  return "no-theme";
}
