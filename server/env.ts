import { config } from "dotenv";

import { raise } from "./utils.js";

config();

const getEnv = (name: string) => process.env[name];
const getEnvOrRaise = (name: string) =>
  getEnv(name) ?? raise(new Error(`${name} environment variable not found`));

export const env = {
  nodeEnv: getEnv("NODE_ENV") ?? "development",
  port: getEnv("PORT") ?? 3000,
  fullHost: getEnvOrRaise("FULL_HOST"),
  emailSender: getEnvOrRaise("EMAIL_SENDER"),
  emailSenderPass: getEnvOrRaise("EMAIL_SENDER_PASS"),
  emailRecipient: getEnvOrRaise("EMAIL_RECIPIENT"),
};
