const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const { Octokit } = require("@octokit/core");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const upload = multer();
const app = express();
const port = process.env.PORT || 3000;
const octokit = new Octokit();

const projects = JSON.parse(fs.readFileSync("public/projects.json"));
const sortProjectsInterval = 3600000; // 1hr
let lastSortTime = Date.now() - sortProjectsInterval - 1;

async function trySortProjects() {
  const currTime = Date.now();
  if (lastSortTime + sortProjectsInterval >= currTime) return;
  lastSortTime = currTime;

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

async function sendMail(data) {
  if (
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

app.post("/", (req, res) => {
  console.log(req.body);
  sendMail(req.body);
  res.redirect("/");
});

app.get("/projects/", (req, res) => {
  trySortProjects();
  return res.json(projects);
});

app.listen(port, () =>
  console.log(`Personal website listening on port ${port}!`)
);
