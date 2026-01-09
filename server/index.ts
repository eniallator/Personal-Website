import acceptWebp from "accept-webp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import { isObjectOf } from "deep-guards";
import express from "express";
import { readFileSync } from "node:fs";
import https from "node:https";

import {
  companies,
  DEFAULT_THEME,
  HOUR_IN_MS,
  initialProjects,
} from "./constants.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { Option } from "./option.js";
import { trySortProjects } from "./project.js";
import { RenderMemo } from "./renderMemo.js";
import { insertSecurityHeaders } from "./securityHeaders.js";
import { calculateSpecialTheme } from "./specialTheme.js";
import { isSpecialTheme, isTheme } from "./types.js";

import type { RequestHandler } from "express";
import type { RenderContext } from "./types.js";

const { fullHost, nodeEnv, port } = env;

let projects = (await trySortProjects(initialProjects)) ?? initialProjects;
const isDevelopment = nodeEnv === "development";

const themeToCookie: RequestHandler = (req, res, next) => {
  const theme = req.query["set-theme"];
  if (isTheme(theme)) {
    res.cookie("theme", theme, { maxAge: 5 * 365.25 * 24 * HOUR_IN_MS });
  }
  next();
};

const app = express();

const renderMemo = new RenderMemo<RenderContext>(
  app,
  ({ theme, specialTheme }) => `${theme}:${specialTheme}`
);

app.set("view engine", "ejs");
app.set("views", "./public");

app.use(
  compression(),
  cookieParser(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  acceptWebp("public"),
  express.static("public"),
  insertSecurityHeaders,
  themeToCookie
);

const hasTheme = isObjectOf({ theme: isTheme });
app.get("/", async (req, res) => {
  void trySortProjects(projects)
    .then((sorted) => {
      if (sorted != null) {
        renderMemo.clear();
        projects = sorted;
      }
    })
    .catch(console.error as (err: unknown) => void);

  const theme = hasTheme(req.cookies) ? req.cookies.theme : DEFAULT_THEME;
  const specialTheme = isSpecialTheme(req.query.theme)
    ? req.query.theme
    : calculateSpecialTheme();
  const ctx = { theme, specialTheme, fullHost, projects, companies };

  try {
    res.send(await renderMemo.render("index.ejs", ctx, isDevelopment));
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong rendering this page ...");
  }
});

app.post("/", (req, res) => {
  void sendMail(req.body);
  res.redirect(req.url);
});

app.get(["/cv/pdf-download", "/resume/pdf-download"], (_req, res) => {
  res.download("public/cv/nialls_cv.pdf");
});

app.use("/resume", express.static("public/cv"));

const server = Option.tupled([
  Option.from(env.sslFullChain).map(readFileSync),
  Option.from(env.sslPrivateKey).map(readFileSync),
])
  .map(([cert, key]) => https.createServer({ cert, key }, app))
  .getOrElse(() => app);

server.listen(port, () => {
  console.log(`Listening on port ${port} in env ${nodeEnv}`);
});
