import sgClient from "@sendgrid/client";
import sgMail from "@sendgrid/mail";

import { raise } from "./utils.js";
import { initEnv } from "./env.js";
import { DATA_FIELDS, HONEY_POT_FIELDS } from "./constants.js";

initEnv();

const env = {
  sendgridApiKey:
    process.env.SENDGRID_API_KEY ??
    raise<string>(new Error("SENDGRID_API_KEY environment variable not found")),
  emailRecipient:
    process.env.EMAIL_RECIPIENT ??
    raise<string>(new Error("EMAIL_RECIPIENT environment variable not found")),
  emailSender:
    process.env.EMAIL_SENDER ??
    raise<string>(new Error("EMAIL_SENDER environment variable not found")),
};

sgMail.setApiKey(env.sendgridApiKey);
sgClient.setApiKey(env.sendgridApiKey);

sgClient
  .request({ url: "/v3/scopes", method: "GET" })
  .then(([_response, body]: [unknown, { scopes: string[] }]) => {
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
  .catch((err: unknown) => {
    console.error(err);
  });

// https://stackoverflow.com/a/9204568/11824244
function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

function validateFields(data: Record<string, string>): data is {
  [S in (typeof DATA_FIELDS)[number]]: string;
} & {
  [S in (typeof HONEY_POT_FIELDS)[number]]: "";
} {
  for (const key in data) {
    if (
      !(DATA_FIELDS as readonly string[]).includes(key) &&
      !(HONEY_POT_FIELDS as readonly string[]).includes(key)
    ) {
      console.log(key, "not in fields");
      return false;
    }
  }
  for (const field of HONEY_POT_FIELDS.values()) {
    if (data[field] == null || data[field].length !== 0) {
      return false;
    }
  }
  for (const field of DATA_FIELDS.values()) {
    if (data[field] == null || data[field].length === 0) {
      return false;
    }
  }
  return true;
}

export async function sendMail(data: Record<string, string>) {
  if (!validateFields(data)) {
    console.log("Received spam:", data);
  } else if (!validateEmail(data.email)) {
    console.log("Received invalid email:", data);
  } else {
    console.log("Sending:", {
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_SENDER,
      subject: `[Personal Site] From ${data.name}`,
      text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
    });
    return sgMail
      .send({
        to: env.emailRecipient,
        from: env.emailSender,
        subject: `[Personal Site] From ${data.name}`,
        text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
      })
      .then(([resp]) => {
        console.log(`Status: ${resp.statusCode}, New email from ${data.name}`);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }
}
