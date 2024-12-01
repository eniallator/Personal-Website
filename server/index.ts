import acceptWebp from "accept-webp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import { isString } from "deep-guards";
import express from "express";

import {
  companies,
  DEFAULT_SPECIAL_THEME,
  DEFAULT_THEME,
  HOUR_IN_MS,
  SPECIAL_THEMES,
  THEMES,
} from "./constants.js";
import env from "./env.js";
import { initProjects, trySortProjects } from "./github.js";
import { sendMail } from "./mail.js";
import { calculateSpecialTheme } from "./specialTheme.js";

let projects = initProjects();
let renderedMemo: Record<string, string> = {};

void trySortProjects(projects)
  .then((sorted) => {
    projects = sorted;
    renderedMemo = {};
  })
  .catch((err: unknown) => {
    console.error(err);
  });

const app = express();

app.set("view engine", "ejs");
app.set("views", "./public");
const port = env.port || 3000;

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(acceptWebp("public"));
app.use(express.static("public"));

app.use((req, res, next) => {
  const setTheme = req.query["set-theme"];
  if (isString(setTheme) && ["light", "dark"].includes(setTheme)) {
    res.cookie("theme", setTheme, { maxAge: HOUR_IN_MS * 24 * 365.25 * 5 });
  }
  next();
});

app.get("/", (req, res) => {
  void trySortProjects(projects)
    .then((sorted) => {
      if (!projects.every((proj, i) => proj.github === sorted[i]?.github)) {
        renderedMemo = {};
        projects = sorted;
      }
    })
    .catch((err: unknown) => {
      console.error(err);
    });

  const cookiesTheme = (req.cookies as Record<string, string>)["theme"];
  const theme =
    cookiesTheme != null && THEMES.includes(cookiesTheme)
      ? cookiesTheme
      : DEFAULT_THEME;
  const specialTheme =
    isString(req.query.theme) &&
    (SPECIAL_THEMES[req.query.theme] != null ||
      req.query.theme === DEFAULT_SPECIAL_THEME)
      ? req.query.theme
      : calculateSpecialTheme();

  const memoKey = `${theme}:${specialTheme}`;
  if (env.nodeEnv !== "development" && renderedMemo[memoKey] != null) {
    res.send(renderedMemo[memoKey]);
  } else {
    const fullHost = `https://${req.get("host")}`;
    console.log(`Rendering to memo "${memoKey}"`);
    res.render(
      "index.ejs",
      { theme, specialTheme, projects, companies, fullHost },
      (err: Error | null, html: string | null) => {
        if (html != null) {
          renderedMemo[memoKey] = html;
          res.send(html);
        } else {
          console.error(err ?? "Unknown rendering error");
          res.status(500).send("Something went wrong rendering this page ...");
        }
      }
    );
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
