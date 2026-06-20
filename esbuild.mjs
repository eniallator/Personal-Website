import { config } from "dotenv";
import * as esbuild from "esbuild";
import fs from "bun:fs";
import rawTargets from "./targets.json" with { type: "json" };

config({ quiet: true });
const env = process.env.NODE_ENV ?? "development";
const isDevelopment = env === "development";

const targets = rawTargets.map(
  ({ browser, version }) => `${browser}${version}`,
);

[
  { entry: "server/**/*.ts", outdir: "dist", platform: "node" },
  {
    entry: "client/ts/index.ts",
    outfile: "public/static/js/bundle.js",
    sourcemap: isDevelopment,
    bundle: true,
    minify: true,
    target: targets,
  },
  ...fs.readdirSync("client/ts/themes").map((name) => ({
    entry: `client/ts/themes/${name}`,
    outfile: `public/static/js/themes/${name.slice(0, -2)}bundle.js`,
    sourcemap: isDevelopment,
    bundle: true,
    minify: true,
    target: targets,
  })),
].forEach(({ entry, ...rest }) => {
  esbuild.buildSync({ entryPoints: [entry], ...rest });
  console.debug(`Built ${entry} in ${env}`);
});
