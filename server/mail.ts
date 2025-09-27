import nodemailer from "nodemailer";

import { env } from "./env.js";
import { isValidMail } from "./types.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: { user: env.emailSender, pass: env.emailSenderPass },
});

export const sendMail = async (data: unknown) => {
  if (!isValidMail(data)) {
    console.warn("Received spam:", data);
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
      const info = await transporter.sendMail(mail);
      console.log(`Response: ${info.response}, New email\n${mailStringified}`);
    } catch (err) {
      console.error("Failed to send", mailStringified, "with", err);
    }
  }
};
