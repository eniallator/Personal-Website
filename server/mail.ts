import sgClient from "@sendgrid/client";
import sgMail from "@sendgrid/mail";
import { isArrayOf, isObjectOf, isString } from "deep-guards";

import env from "./env.js";
import { isValidMail } from "./types.js";

sgMail.setApiKey(env.sendgridApiKey);
sgClient.setApiKey(env.sendgridApiKey);

const [_, body] = (await sgClient.request({
  url: "/v3/scopes",
  method: "GET",
})) as [unknown, unknown];

if (
  isObjectOf({ scopes: isArrayOf(isString) })(body) &&
  body.scopes.includes("mail.send")
) {
  console.log("Scopes result", body.scopes);
} else {
  throw new Error("Invalid scopes");
}

export const sendMail = async (data: unknown) => {
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
    } catch (err) {
      console.log(`Failed with ${mailStringified}`);
      console.error(err);
    }
  }
};
