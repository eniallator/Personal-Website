import { config } from "dotenv";

import { raise } from "./utils.js";

config({ quiet: true });

const getEnv = (name: string) => process.env[name];
const getEnvOrRaise = (name: string) =>
  getEnv(name) ?? raise(new Error(`${name} environment variable not found`));

export const env = {
  port: getEnv("PORT") ?? 3000,
  nodeEnv: getEnv("NODE_ENV") ?? "development",
  sslFullChain: getEnv("SSL_FULL_CHAIN_PATH"),
  sslPrivateKey: getEnv("SSL_PRIVATE_KEY_PATH"),
  fullHost: getEnvOrRaise("FULL_HOST"),
  emailSender: getEnvOrRaise("EMAIL_SENDER"),
  emailSenderPass: getEnvOrRaise("EMAIL_SENDER_PASS"),
  emailRecipient: getEnvOrRaise("EMAIL_RECIPIENT"),
};
