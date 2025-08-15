import acceptWebp from "accept-webp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import { isObjectOf } from "deep-guards";
import express from "express";

import {
  companies,
  DEFAULT_THEME,
  HOUR_IN_MS,
  initialProjects,
} from "./constants.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { trySortProjects } from "./project.js";
import { calculateSpecialTheme } from "./specialTheme.js";
import { isSpecialTheme, isTheme } from "./types.js";

import type { RequestHandler } from "express";
import type { SpecialTheme, Theme } from "./types.js";
import { insertSecurityHeaders } from "./securityHeaders.js";

const { fullHost, nodeEnv, port } = env;

const memoKey = (theme: Theme, specialTheme: SpecialTheme) =>
  `${theme}:${specialTheme}` as const;
let renderedMemo: Partial<Record<ReturnType<typeof memoKey>, string>> = {};

let projects = (await trySortProjects(initialProjects)) ?? initialProjects;

const themeToCookie: RequestHandler = (req, res, next) => {
  const theme = req.query["set-theme"];
  if (isTheme(theme)) {
    res.cookie("theme", theme, { maxAge: 5 * 365.25 * 24 * HOUR_IN_MS });
  }
  next();
};

const app = express();

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
app.get("/", (req, res) => {
  void trySortProjects(projects)
    .then((sorted) => {
      if (sorted != null) {
        renderedMemo = {};
        projects = sorted;
      }
    })
    .catch(console.error as (err: unknown) => void);

  const theme = hasTheme(req.cookies) ? req.cookies.theme : DEFAULT_THEME;
  const specialTheme = isSpecialTheme(req.query.theme)
    ? req.query.theme
    : calculateSpecialTheme();
  const key = memoKey(theme, specialTheme);

  if (nodeEnv !== "development" && renderedMemo[key] != null) {
    res.send(renderedMemo[key]);
  } else {
    console.log(`Rendering to memo "${key}"`);
    const ctx = { theme, specialTheme, fullHost, projects, companies };
    res.render("index.ejs", ctx, (err: Error | null, html: string | null) => {
      if (html != null) {
        renderedMemo[key] = html;
        res.send(html);
      } else {
        console.error(err ?? "Unknown rendering error");
        res.status(500).send("Something went wrong rendering this page ...");
      }
    });
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

app.listen(port, () => {
  console.log(`Listening on port ${port} in env ${nodeEnv}`);
});
