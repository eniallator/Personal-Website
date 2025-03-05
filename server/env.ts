import { config } from "dotenv";

import { raise } from "./utils.ts";

config();

const getEnv = (name: string) => process.env[name];
const getEnvOrRaise = (name: string) =>
  getEnv(name) ?? raise(new Error(`${name} environment variable not found`));

export default {
  port: getEnv("PORT"),
  nodeEnv: getEnv("NODE_ENV"),
  fullHost: getEnvOrRaise("FULL_HOST"),
  emailSender: getEnvOrRaise("EMAIL_SENDER"),
  emailRecipient: getEnvOrRaise("EMAIL_RECIPIENT"),
  sendgridApiKey: getEnvOrRaise("SENDGRID_API_KEY"),
};
