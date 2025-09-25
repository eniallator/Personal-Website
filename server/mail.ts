import nodemailer from "nodemailer";

import { env } from "./env.js";
import { isValidMail } from "./types.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: env.emailSender, pass: env.emailSenderPass },
});

const checkVerification = async (): Promise<Error | null> => {
  try {
    await transporter.verify();
    return null;
  } catch (err) {
    return err as Error;
  }
};

setInterval(() => {
  void checkVerification().then((err) => {
    if (err != null) {
      console.warn("Verification down", err);
    }
  });
}, 5 * 6e4);

export const sendMail = async (data: unknown) => {
  const verificationErr = await checkVerification();
  if (!isValidMail(data)) {
    console.warn("Received spam:", data);
  } else if (verificationErr != null) {
    console.warn("Failed email verification!", verificationErr, "with", data);
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
      console.error(`Failed with ${mailStringified}\n${JSON.stringify(err)}`);
    }
  }
};
