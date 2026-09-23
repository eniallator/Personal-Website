import fs from "bun:fs";
import * as esbuild from "esbuild";
import { mapFilter, Option } from "niall-utils";

import { browserslist } from "../package.json" with { type: "json" };

const env = process.env.NODE_ENV ?? "development";
const fileDenySet = new Set(["client/ts/helpers.ts"]);

const target = browserslist.map(browser => browser.replace(/\s+/, ""));
const sourcemap = env === "development";

mapFilter(fs.readdirSync("client/ts", { recursive: true }), name =>
  Option.some(`client/ts/${name}`)
    .filter(entry => !fileDenySet.has(entry) && fs.statSync(entry).isFile())
    .map(entry => ({
      entry,
      outfile: `public/static/js/${name.slice(0, -2)}bundle.js`,

      target,
      sourcemap,
      bundle: true,
      minify: true,
    }))
)
  .concat([{ entry: "server/**/*.ts", outdir: "dist", platform: "node" }])
  .forEach(({ entry, ...rest }) => {
    esbuild.buildSync({ entryPoints: [entry], ...rest });
    console.debug(`Built ${entry} in ${env}`);
  });
