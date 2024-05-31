const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const fs = require("fs");
const { Octokit } = require("@octokit/core");
const acceptWebp = require("accept-webp");
const compression = require("compression");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
const upload = multer();
const app = express();

app.set("view engine", "ejs");
app.set("views", "./public");
const port = process.env.PORT || 3000;
const octokit = new Octokit();

sgClient
  .request({ url: "/v3/scopes", method: "GET" })
  .then(([_response, body]) => {
    console.log("Scopes result", body.scopes);
    if (
      "scopes" in body &&
      Array.isArray(body.scopes) &&
      body.scopes.includes("mail.send")
    ) {
      console.log("Happiness! Includes mail.send");
    } else {
      throw new Error("Invalid scopes");
    }
  })
  .catch(console.error);

const companies = JSON.parse(fs.readFileSync("public/companies.json"));
const projects = JSON.parse(fs.readFileSync("public/projects.json"));
const hourInMs = 3600000;
const sortProjectsInterval = hourInMs;
let lastSortTime = Date.now() - sortProjectsInterval - 1;
let currentTheme = "no-theme";
const daysThemeIsShowing = 7;
const halfMsThemeIsShowing = daysThemeIsShowing * 12 * hourInMs;

const themes = {
  halloween: {
    month: 9,
    day: 31,
  },
  christmas: {
    month: 11,
    day: 25,
  },
};

function updateCurrentTheme() {
  const currDate = new Date();
  currentTheme = "no-theme";
  for (let theme of Object.keys(themes)) {
    let msToTheme;
    for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
      const themeDate = new Date(
        currDate.getFullYear() + yearOffset,
        themes[theme].month,
        themes[theme].day,
        12
      );
      const currMsToTheme = Math.abs(themeDate.getTime() - currDate.getTime());
      if (msToTheme === undefined || currMsToTheme < msToTheme) {
        msToTheme = currMsToTheme;
      }
    }

    if (msToTheme < halfMsThemeIsShowing) {
      currentTheme = theme;
      break;
    }
  }
  console.log(`Current theme: ${currentTheme}`);
}

async function trySortProjects() {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval >= currTime) return;
  lastSortTime = currTime;

  updateCurrentTheme();

  let repos = [];
  let page = 1;
  const perPage = 100;
  let resp;
  try {
    do {
      resp = await octokit.request("GET /users/eniallator/repos", {
        username: "eniallator",
        per_page: perPage,
        page: page++,
        sort: "pushed",
        direction: "desc",
      });
      if (resp.data) {
        repos = repos.concat(resp.data.map((repo) => repo.name.toLowerCase()));
      }
    } while (resp.data && resp.data.length === perPage);

    projects.sort(
      (p1, p2) =>
        repos.indexOf(p1.github.toLowerCase()) -
        repos.indexOf(p2.github.toLowerCase())
    );
  } catch {}
}
trySortProjects();

// https://stackoverflow.com/a/9204568/11824244
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

const honeyPotFields = new Set([
  "phone",
  "city",
  "address",
  "country",
  "zip code",
]);

const dataFields = new Set(["name", "email", "message"]);

function validateFields(data) {
  for (const key in data) {
    if (!dataFields.has(key) && !honeyPotFields.has(key)) {
      return false;
    }
  }
  for (const field of honeyPotFields.values()) {
    if (data[field] == null || data[field].length !== 0) {
      return false;
    }
  }
  for (const field of dataFields.values()) {
    if (data[field] == null || data[field].length === 0) {
      return false;
    }
  }
  return true;
}

async function sendMail(data) {
  if (!validateFields(data) || !validateEmail(data.email)) {
    console.log("Received spam:", data);
  } else {
    console.log("Sending:", {
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_SENDER,
      subject: `[Personal Site] From ${data.name}`,
      text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
    });
    sgMail
      .send({
        to: process.env.EMAIL_RECIPIENT,
        from: process.env.EMAIL_SENDER,
        subject: `[Personal Site] From ${data.name}`,
        text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
      })
      .then(() => console.log(`New email from ${data.name}`))
      .catch(console.error);
  }
}

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(upload.array());
app.use(acceptWebp("public", ["jpg", "jpeg", "png"]));
app.use(express.static("public"));

app.use((req, res, next) => {
  if (["light", "dark"].includes(req.query["set-theme"])) {
    res.cookie("theme", req.query["set-theme"]);
  }
  next();
});

app.get("/", (req, res) => {
  res.render("index.ejs", {
    theme: req.cookies["theme"],
    specialTheme:
      themes[req.query.theme] || req.query.theme === "no-theme"
        ? req.query.theme
        : currentTheme,
    projects,
    companies,
  });
});

app.post("/", (req, res) => {
  sendMail(req.body);
  res.redirect(req.url);
});

app.get("/projects/", (_req, res) => {
  trySortProjects();
  return res.json(projects);
});

app.get("/resume|cv/pdf-download", (_req, res) =>
  res.download("public/cv/nialls_cv.pdf")
);

app.use("/resume/", express.static("public/cv"));

app.listen(port, () =>
  console.log(`Personal website listening on port ${port}!`)
);
