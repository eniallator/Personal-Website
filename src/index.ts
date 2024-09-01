import acceptWebp from "accept-webp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";

import { companies, THEMES } from "./constants.js";
import { initProjects, trySortProjects } from "./github.js";
import { sendMail } from "./mail.js";
import { isString } from "./utils.js";
import { calculateCurrentTheme } from "./theme.js";
import env from "./env.js";

let projects = initProjects();

void trySortProjects(projects)
  .then((sorted) => {
    projects = sorted;
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

app.use(acceptWebp("public/static/images"));
app.use(express.static("public"));

app.use((req, res, next) => {
  const setTheme = req.query["set-theme"];
  if (isString(setTheme) && ["light", "dark"].includes(setTheme)) {
    res.cookie("theme", setTheme);
  }
  next();
});

app.get("/", (req, res) => {
  void trySortProjects(projects)
    .then((sorted) => {
      projects = sorted;
    })
    .catch((err: unknown) => {
      console.error(err);
    });

  res.render("index.ejs", {
    theme: (req.cookies as Record<string, string>)["theme"],
    specialTheme:
      isString(req.query.theme) &&
      (req.query.theme in THEMES || req.query.theme === "no-theme")
        ? req.query.theme
        : calculateCurrentTheme(),
    projects,
    companies,
  });
});

app.post("/", (req, res) => {
  void sendMail(req.body as Record<string, string>);
  res.redirect(req.url);
});

app.get("/projects/", (_req, res) => res.json(projects));

app.get("/resume|cv/pdf-download", (_req, res) => {
  res.download("public/cv/nialls_cv.pdf");
});

app.use("/resume/", express.static("public/cv"));

app.listen(port, () => {
  console.log(`Personal website listening on port ${port}!`);
});
