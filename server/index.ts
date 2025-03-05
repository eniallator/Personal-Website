import acceptWebp from "accept-webp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import { isObjectOf } from "deep-guards";

import {
  companies,
  DEFAULT_THEME,
  HOUR_IN_MS,
  initialProjects,
} from "./constants.ts";
import env from "./env.ts";
import { trySortProjects } from "./github.ts";
import { sendMail } from "./mail.ts";
import { calculateSpecialTheme } from "./specialTheme.ts";
import { isSpecialTheme, isTheme } from "./types.ts";

let projects = (await trySortProjects(initialProjects)) ?? initialProjects;
let renderedMemo: Record<string, string> = {};

const app = express();

app.set("view engine", "ejs");
app.set("views", "./public");
const port = env.port ?? 3000;

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(acceptWebp("public"));
app.use(express.static("public"));

app.use((req, res, next) => {
  const theme = req.query["set-theme"];
  if (isTheme(theme)) {
    res.cookie("theme", theme, { maxAge: HOUR_IN_MS * 24 * 365.25 * 5 });
  }
  next();
});

app.get("/", (req, res) => {
  void trySortProjects(projects)
    .then((sorted) => {
      if (sorted != null) {
        renderedMemo = {};
        projects = sorted;
      }
    })
    .catch(console.error as (err: unknown) => void);

  const ctx = {
    theme: isObjectOf({ theme: isTheme })(req.cookies)
      ? req.cookies.theme
      : DEFAULT_THEME,
    specialTheme: isSpecialTheme(req.query.theme)
      ? req.query.theme
      : calculateSpecialTheme(),
    fullHost: env.fullHost,
    projects,
    companies,
  };

  const memoKey = `${ctx.theme}:${ctx.specialTheme}` as const;
  if (env.nodeEnv !== "development" && renderedMemo[memoKey] != null) {
    res.send(renderedMemo[memoKey]);
  } else {
    console.log(`Rendering to memo "${memoKey}"`);
    res.render("index.ejs", ctx, (err: Error | null, html: string | null) => {
      if (html != null) {
        renderedMemo[memoKey] = html;
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
  console.log(`Listening on port ${port} in env ${env.nodeEnv}`);
});
