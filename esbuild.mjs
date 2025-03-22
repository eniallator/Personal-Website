import * as esbuild from "esbuild";
import fs from "fs";

const isDevelopment =
  process.env.NODE_ENV != null ? process.env.NODE_ENV === "development" : true;

[
  { entry: "server/**/*.ts", outdir: "dist", platform: "node" },
  {
    entry: "client/ts/index.ts",
    outfile: "public/static/js/bundle.js",
    sourcemap: isDevelopment,
    bundle: true,
    minify: true,
  },
  ...fs.readdirSync("client/ts/themes").map((name) => ({
    entry: `client/ts/themes/${name}`,
    outfile: `public/static/js/themes/${name.slice(0, -2)}bundle.js`,
    sourcemap: isDevelopment,
    bundle: true,
    minify: true,
  })),
].forEach(({ entry, ...rest }) => {
  esbuild.buildSync({ entryPoints: [entry], ...rest });
  console.log(`Built ${entry}`);
});
