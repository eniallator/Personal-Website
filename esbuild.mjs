import * as esbuild from "esbuild";
import fs from "node:fs";
import rawTargets from "./targets.json" with { type: "json" };

const targets = rawTargets.map(
  ({ browser, version }) => `${browser}${version}`,
);

const isDevelopment =
  process.env.NODE_ENV == null || process.env.NODE_ENV === "development";

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
  console.debug(`Built ${entry}`);
});
