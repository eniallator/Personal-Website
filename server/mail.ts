import sgClient from "@sendgrid/client";
import sgMail from "@sendgrid/mail";
import {
  isArrayOf,
  isObjectOf,
  isString,
  isTupleOf,
  isUnknown,
} from "deep-guards";

import env from "./env.js";
import { isValidMail } from "./types.js";

sgMail.setApiKey(env.sendgridApiKey);
sgClient.setApiKey(env.sendgridApiKey);

const bodyGuard = isTupleOf(
  isUnknown,
  isObjectOf({ scopes: isArrayOf(isString) })
);

void sgClient.request({ url: "/v3/scopes", method: "GET" }, (_, r: unknown) => {
  if (bodyGuard(r) && r[1].scopes.includes("mail.send")) {
    console.log("Scopes result", r[1].scopes);
  } else {
    throw new Error("Invalid scopes");
  }
});

export async function sendMail(data: unknown) {
  if (!isValidMail(data)) {
    console.log("Received spam:", data);
  } else {
    const mail = {
      from: env.emailSender,
      to: env.emailRecipient,
      subject: `[Personal Site] From ${data.name}`,
      text: `Name: ${data.name}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`,
    };
    const mailStringified = Object.entries(mail)
      .map(([k, v]) => `${k}: <<<${v}>>>`)
      .join("\n");

    try {
      const [resp] = await sgMail.send(mail);
      console.log(`Status: ${resp.statusCode}, New email\n${mailStringified}`);
    } catch (err: unknown) {
      console.log(`Failed with ${mailStringified}`);
      console.error(err);
    }
  }
}
