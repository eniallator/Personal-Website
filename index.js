const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const axios = require("axios");
const { Octokit } = require("@octokit/core");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const upload = multer();
const app = express();

app.set("view engine", "ejs");
app.set("views", "./public");
const port = process.env.PORT || 3000;
const octokit = new Octokit();

const projects = JSON.parse(fs.readFileSync("public/projects.json"));
const sortProjectsInterval = 3600000; // 1hr
let lastSortTime = Date.now() - sortProjectsInterval - 1;
let currentTheme = "no-theme";
const daysThemeIsShowing = 7;
const halfMsThemeIsShowing = daysThemeIsShowing * 43200000; // 12hrs

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
  const per_page = 100;
  let resp;
  do {
    resp = await octokit.request("GET /users/eniallator/repos", {
      username: "eniallator",
      per_page: per_page,
      page: page++,
      sort: "updated",
      direction: "desc",
    });
    if (resp.data) {
      repos = repos.concat(resp.data.map((repo) => repo.name.toLowerCase()));
    }
  } while (resp.data && resp.data.length === per_page);

  projects.sort(
    (p1, p2) =>
      repos.indexOf(p1.github.toLowerCase()) -
      repos.indexOf(p2.github.toLowerCase())
  );
}
trySortProjects();

// https://stackoverflow.com/a/9204568/11824244
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

async function validateRecaptcha(token) {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
  );
  return response.data.success && response.data.score >= 0.5;
}

async function sendMail(data) {
  if (
    !(await validateRecaptcha(data.recaptcha)) ||
    data.name.length === 0 ||
    !validateEmail(data.email) ||
    data.message.length === 0
  )
    return;
  sgMail
    .send({
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_SENDER,
      subject: `[Personal Site] From ${data.name}`,
      text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
    })
    .then(() => console.log(`New email from ${data.name}`))
    .catch((error) => console.log(error));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(upload.array());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    theme:
      themes[req.query.theme] || req.query.theme === "no-theme"
        ? req.query.theme
        : currentTheme,
  });
});

app.post("/", (req, res) => {
  console.log(req.body);
  sendMail(req.body);
  res.redirect(req.url);
});

app.get("/projects/", (req, res) => {
  trySortProjects();
  return res.json(projects);
});

app.get("/resume/pdf-download/", (req, res) =>
  res.download("public/resume/nialls_resume.pdf")
);

app.get("/cv/", (req, res) => res.redirect("/resume/"));
app.get("/cv/pdf-download/", (req, res) =>
  res.redirect("/resume/pdf-download/")
);

app.listen(port, () =>
  console.log(`Personal website listening on port ${port}!`)
);
