const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const upload = multer();
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
