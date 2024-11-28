import sgClient from "@sendgrid/client";
import sgMail from "@sendgrid/mail";

import { mailGuard } from "./constants.js";
import env from "./env.js";

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

export async function sendMail(data: unknown) {
  if (!mailGuard(data)) {
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
    return sgMail
      .send(mail)
      .then(([resp]) => {
        console.log(
          `Status: ${resp.statusCode}, New email\n${mailStringified}`
        );
      })
      .catch((err: unknown) => {
        console.log(`Failed with ${mailStringified}`);
        console.error(err);
      });
  }
}
