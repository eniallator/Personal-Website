import { config } from "dotenv";

import { raise } from "./utils.js";

config();

export default {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  fullHost:
    process.env.FULL_HOST ??
    raise<string>(new Error("FULL_HOST environment variable not found")),
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
