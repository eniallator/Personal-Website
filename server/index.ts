import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { getCookie, setCookie } from "hono/cookie";

import { companies, DEFAULT_THEME, initialProjects } from "./constants.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { trySortProjects } from "./project.js";
import { RenderMemo } from "./renderMemo.js";
import { calculateSpecialTheme } from "./specialTheme.js";
import { isSpecialTheme, isTheme } from "./types.js";

import { Option } from "niall-utils";
import type { RenderContext } from "./types.js";

const { fullHost, nodeEnv, port } = env;

let projects = await trySortProjects(initialProjects);
const staticDir = "public";
const isDevelopment = nodeEnv === "development";

const app = new Hono();

app.use("/*", serveStatic({ root: staticDir }));
app.use(async (c, next) => {
  const theme = c.req.query("set-theme");

  if (isTheme(theme)) {
    setCookie(c, "theme", theme, {
      maxAge: 5 * 365.25 * 24 * 60 * 60,
      path: "/",
    });
  }

  await next();
});

const renderMemo = new RenderMemo<RenderContext>(
  (name, ctx) => `${ctx.theme}:${ctx.specialTheme}/${name}`,
);

app.get("/", async (c) => {
  void trySortProjects(projects)
    .then((sorted) => {
      if (sorted.some((proj, i) => projects.at(i)?.github !== proj.github)) {
        renderMemo.clear();
        projects = sorted;
      }
    })
    .catch(console.error as (err: unknown) => void);

  const theme = Option.from(getCookie(c, "theme"))
    .guard(isTheme)
    .getOrElse(() => DEFAULT_THEME);
  const specialTheme = Option.from(c.req.query("theme"))
    .guard(isSpecialTheme)
    .getOrElse(calculateSpecialTheme);
  const ctx = { theme, specialTheme, fullHost, projects, companies };

  try {
    const html = await renderMemo.render(
      `${staticDir}/index.ejs`,
      ctx,
      isDevelopment,
    );
    return c.html(html);
  } catch (err) {
    console.error(err);
    return c.text("Something went wrong rendering this page ...", 500);
  }
});

app.post("/", async (c) => {
  console.log(`New POST from ${c.req.header("user-agent")}`);
  void sendMail(await c.req.parseBody());
  return c.redirect(c.req.url);
});

app.get(
  "/cv/pdf-download",
  async (c, next) => {
    c.header("Content-Disposition", 'attachment; filename="nialls_cv.pdf"');
    await next();
  },
  serveStatic({ path: "./public/cv/nialls_cv.pdf" }),
);

const server = Bun.serve({
  fetch: app.fetch,
  port,
  development: isDevelopment,
});

console.log(`Listening on http://${server.hostname}:${port} in env ${nodeEnv}`);
