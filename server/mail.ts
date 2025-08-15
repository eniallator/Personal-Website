import nodemailer from "nodemailer";

import { env } from "./env.js";
import { isValidMail } from "./types.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: env.emailSender, pass: env.emailSenderPass },
});

try {
  await transporter.verify();
  console.log("Can send emails!");
} catch (err) {
  throw new Error(`Failed email verification ${err}`);
}

export const sendMail = async (data: unknown) => {
  if (isValidMail(data)) {
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
      const info = await transporter.sendMail(mail);
      console.log(`Response: ${info.response}, New email\n${mailStringified}`);
    } catch (err) {
      console.error(`Failed with ${mailStringified}\n${JSON.stringify(err)}`);
    }
  } else {
    console.warn("Received spam:", data);
  }
};
